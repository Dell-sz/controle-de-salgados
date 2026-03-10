const { db, exec, get, all, query } = require('../config/database');

exports.listarProducoes = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let queryStr = `
            SELECT p.*, u.nome as responsavel_nome
            FROM producoes p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
        `;
        
        const params = [];
        
        if (data_inicio && data_fim) {
            queryStr += ` WHERE p.data BETWEEN ? AND ?`;
            params.push(data_inicio, data_fim);
        } else if (data_inicio) {
            queryStr += ` WHERE p.data >= ?`;
            params.push(data_inicio);
        } else if (data_fim) {
            queryStr += ` WHERE p.data <= ?`;
            params.push(data_fim);
        }
        
        queryStr += ` ORDER BY p.data DESC`;
        
        const result = await query(queryStr, params);
        
        // Buscar itens para cada produção
        for (let producao of result.rows) {
            const itensResult = await query(
                `SELECT pi.*, pr.nome as produto_nome
                 FROM producao_itens pi
                 JOIN produtos pr ON pr.id = pi.produto_id
                 WHERE pi.producao_id = ?`,
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
        const result = await query(
            `SELECT p.*, u.nome as responsavel_nome
             FROM producoes p
             LEFT JOIN usuarios u ON u.id = p.responsavel_id
             WHERE p.id = ?`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produção não encontrada' });
        }
        
        const producao = result.rows[0];
        
        // Buscar itens
        const itensResult = await query(
            `SELECT pi.*, pr.nome as produto_nome, pr.valor_unitario
             FROM producao_itens pi
             JOIN produtos pr ON pr.id = pi.produto_id
             WHERE pi.producao_id = ?`,
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
    
    try {
        // Inserir produção
        exec(
            `INSERT INTO producoes (data, responsavel_id, massa_produzida, recheio_produzido,
             sobra_massa, sobra_recheio, custo_massa_kg, custo_recheio_kg,
             custo_embalagem, custo_mao_obra, observacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data, responsavel_id || req.usuarioId, massa_produzida, recheio_produzido,
             sobra_massa || 0, sobra_recheio || 0, custo_massa_kg || 0, custo_recheio_kg || 0,
             custo_embalagem || 0, custo_mao_obra || 0, observacao]
        );
        
        // Pegar o ID da produção criada
        const producaoId = db.prepare('SELECT last_insert_rowid() as id').get().id;
        
        const producao = get(
            'SELECT p.*, u.nome as responsavel_nome FROM producoes p LEFT JOIN usuarios u ON u.id = p.responsavel_id WHERE p.id = ?',
            [producaoId]
        );
        
        // Inserir itens e atualizar estoque
        if (itens && itens.length > 0) {
            for (let item of itens) {
                // Inserir item
                exec(
                    `INSERT INTO producao_itens (producao_id, produto_id, quantidade, massa_usada, recheio_usado, custo_unitario)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [producaoId, item.produto_id, item.quantidade, item.massa_usada, item.recheio_usado, item.custo_unitario || 0]
                );
                
                // Atualizar estoque (inserir ou somar)
                const estoqueExistente = get('SELECT quantidade FROM estoque WHERE produto_id = ?', [item.produto_id]);
                if (estoqueExistente) {
                    exec('UPDATE estoque SET quantidade = quantidade + ?, atualizado_em = CURRENT_TIMESTAMP WHERE produto_id = ?',
                        [item.quantidade, item.produto_id]);
                } else {
                    exec('INSERT INTO estoque (produto_id, quantidade) VALUES (?, ?)',
                        [item.produto_id, item.quantidade]);
                }
            }
        }
        
        // Retornar produção com itens
        const itensResult = all(
            `SELECT pi.*, pr.nome as produto_nome
             FROM producao_itens pi
             JOIN produtos pr ON pr.id = pi.produto_id
             WHERE pi.producao_id = ?`,
            [producaoId]
        );
        
        producao.itens = itensResult;
        
        res.status(201).json(producao);
    } catch (error) {
        console.error('Erro ao criar produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarProducao = async (req, res) => {
    const { id } = req.params;
    const { data, massa_produzida, recheio_produzido, sobra_massa, sobra_recheio, observacao } = req.body;
    
    try {
        const result = await query(
            `UPDATE producoes 
             SET data = COALESCE(?, data),
                 massa_produzida = COALESCE(?, massa_produzida),
                 recheio_produzido = COALESCE(?, recheio_produzido),
                 sobra_massa = COALESCE(?, sobra_massa),
                 sobra_recheio = COALESCE(?, sobra_recheio),
                 observacao = COALESCE(?, observacao)
             WHERE id = ?`,
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
    
    try {
        // Buscar itens da produção
        const itensResult = all('SELECT produto_id, quantidade FROM producao_itens WHERE producao_id = ?', [id]);
        
        // Devolver itens ao estoque
        for (let item of itensResult) {
            exec('UPDATE estoque SET quantidade = quantidade - ?, atualizado_em = CURRENT_TIMESTAMP WHERE produto_id = ?',
                [item.quantidade, item.produto_id]);
        }
        
        // Excluir produção (itens são excluídos em cascade)
        exec('DELETE FROM producoes WHERE id = ?', [id]);
        
        res.json({ mensagem: 'Produção excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.getEstatisticasProducao = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let queryStr = `
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
            queryStr += ` WHERE p.data BETWEEN ? AND ?`;
            params.push(data_inicio, data_fim);
        }
        
        queryStr += ` GROUP BY pr.id, pr.nome ORDER BY total_unidades DESC`;
        
        const result = await query(queryStr, params);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

