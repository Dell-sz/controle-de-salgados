const db = require('../config/database');

exports.listarProducoes = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let query = `
            SELECT p.*, u.nome as responsavel_nome
            FROM producoes p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
        `;
        
        const params = [];
        
        if (data_inicio && data_fim) {
            query += ` WHERE p.data BETWEEN $1 AND $2`;
            params.push(data_inicio, data_fim);
        } else if (data_inicio) {
            query += ` WHERE p.data >= $1`;
            params.push(data_inicio);
        } else if (data_fim) {
            query += ` WHERE p.data <= $1`;
            params.push(data_fim);
        }
        
        query += ` ORDER BY p.data DESC`;
        
        const result = await db.query(query, params);
        
        // Buscar itens para cada produção
        for (let producao of result.rows) {
            const itensResult = await db.query(
                `SELECT pi.*, pr.nome as produto_nome
                 FROM producao_itens pi
                 JOIN produtos pr ON pr.id = pi.produto_id
                 WHERE pi.producao_id = $1`,
                [producao.id]
            );
            producao.itens = itensResult.rows;
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar produções:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarProducao = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            `SELECT p.*, u.nome as responsavel_nome
             FROM producoes p
             LEFT JOIN usuarios u ON u.id = p.responsavel_id
             WHERE p.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produção não encontrada' });
        }
        
        const producao = result.rows[0];
        
        // Buscar itens
        const itensResult = await db.query(
            `SELECT pi.*, pr.nome as produto_nome, pr.valor_unitario
             FROM producao_itens pi
             JOIN produtos pr ON pr.id = pi.produto_id
             WHERE pi.producao_id = $1`,
            [id]
        );
        
        producao.itens = itensResult.rows;
        
        res.json(producao);
    } catch (error) {
        console.error('Erro ao buscar produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.criarProducao = async (req, res) => {
    const { 
        data, responsavel_id, massa_produzida, recheio_produzido,
        sobra_massa, sobra_recheio, custo_massa_kg, custo_recheio_kg,
        custo_embalagem, custo_mao_obra, observacao, itens 
    } = req.body;
    
    if (!data || !massa_produzida || !recheio_produzido) {
        return res.status(400).json({ erro: 'Data, massa e recheio são obrigatórios' });
    }
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Inserir produção
        const producaoResult = await client.query(
            `INSERT INTO producoes (data, responsavel_id, massa_produzida, recheio_produzido,
             sobra_massa, sobra_recheio, custo_massa_kg, custo_recheio_kg,
             custo_embalagem, custo_mao_obra, observacao)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [data, responsavel_id || req.usuarioId, massa_produzida, recheio_produzido,
             sobra_massa || 0, sobra_recheio || 0, custo_massa_kg || 0, custo_recheio_kg || 0,
             custo_embalagem || 0, custo_mao_obra || 0, observacao]
        );
        
        const producao = producaoResult.rows[0];
        
        // Inserir itens e atualizar estoque
        if (itens && itens.length > 0) {
            for (let item of itens) {
                // Inserir item
                await client.query(
                    `INSERT INTO producao_itens (producao_id, produto_id, quantidade, massa_usada, recheio_usado, custo_unitario)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [producao.id, item.produto_id, item.quantidade, item.massa_usada, item.recheio_usado, item.custo_unitario || 0]
                );
                
                // Atualizar estoque
                await client.query(
                    `INSERT INTO estoque (produto_id, quantidade)
                     VALUES ($1, $2)
                     ON CONFLICT (produto_id) DO UPDATE SET
                        quantidade = estoque.quantidade + $2,
                        atualizado_em = CURRENT_TIMESTAMP`,
                    [item.produto_id, item.quantidade]
                );
            }
        }
        
        await client.query('COMMIT');
        
        // Retornar produção com itens
        const itensResult = await db.query(
            `SELECT pi.*, pr.nome as produto_nome
             FROM producao_itens pi
             JOIN produtos pr ON pr.id = pi.produto_id
             WHERE pi.producao_id = $1`,
            [producao.id]
        );
        
        producao.itens = itensResult.rows;
        
        res.status(201).json(producao);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
};

exports.atualizarProducao = async (req, res) => {
    const { id } = req.params;
    const { data, massa_produzida, recheio_produzido, sobra_massa, sobra_recheio, observacao } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE producoes 
             SET data = COALESCE($1, data),
                 massa_produzida = COALESCE($2, massa_produzida),
                 recheio_produzido = COALESCE($3, recheio_produzido),
                 sobra_massa = COALESCE($4, sobra_massa),
                 sobra_recheio = COALESCE($5, sobra_recheio),
                 observacao = COALESCE($6, observacao)
             WHERE id = $7 RETURNING *`,
            [data, massa_produzida, recheio_produzido, sobra_massa, sobra_recheio, observacao, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produção não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.excluirProducao = async (req, res) => {
    const { id } = req.params;
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Buscar itens da produção
        const itensResult = await client.query(
            'SELECT produto_id, quantidade FROM producao_itens WHERE producao_id = $1',
            [id]
        );
        
        // Devolver itens ao estoque
        for (let item of itensResult.rows) {
            await client.query(
                'UPDATE estoque SET quantidade = quantidade - $1, atualizado_em = CURRENT_TIMESTAMP WHERE produto_id = $2',
                [item.quantidade, item.produto_id]
            );
        }
        
        // Excluir produção (itens são excluídos em cascade)
        const result = await client.query(
            'DELETE FROM producoes WHERE id = $1 RETURNING id',
            [id]
        );
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ erro: 'Produção não encontrada' });
        }
        
        await client.query('COMMIT');
        
        res.json({ mensagem: 'Produção excluída com sucesso' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao excluir produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
};

exports.getEstatisticasProducao = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let query = `
            SELECT pr.nome,
                   SUM(pi.quantidade) as total_unidades,
                   SUM(pi.massa_usada) as total_massa,
                   SUM(pi.recheio_usado) as total_recheio,
                   SUM(pi.quantidade * pi.custo_unitario) as custo_total
            FROM producao_itens pi
            JOIN produtos pr ON pr.id = pi.produto_id
            JOIN producoes p ON p.id = pi.producao_id
        `;
        
        const params = [];
        
        if (data_inicio && data_fim) {
            query += ` WHERE p.data BETWEEN $1 AND $2`;
            params.push(data_inicio, data_fim);
        }
        
        query += ` GROUP BY pr.id, pr.nome ORDER BY total_unidades DESC`;
        
        const result = await db.query(query, params);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

