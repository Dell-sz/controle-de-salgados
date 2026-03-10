const db = require('../config/database');

exports.listarSaidas = async (req, res) => {
    const { data_inicio, data_fim, destino_id, pago } = req.query;
    
    try {
        let query = `
            SELECT s.*, u.nome as responsavel_nome, d.nome as destino_nome
            FROM saidas s
            LEFT JOIN usuarios u ON u.id = s.responsavel_id
            LEFT JOIN destinos d ON d.id = s.destino_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (data_inicio) {
            paramCount++;
            query += ` AND s.data >= $${paramCount}`;
            params.push(data_inicio);
        }
        
        if (data_fim) {
            paramCount++;
            query += ` AND s.data <= $${paramCount}`;
            params.push(data_fim);
        }
        
        if (destino_id) {
            paramCount++;
            query += ` AND s.destino_id = $${paramCount}`;
            params.push(destino_id);
        }
        
        if (pago !== undefined) {
            paramCount++;
            query += ` AND s.pago = $${paramCount}`;
            params.push(pago === 'true');
        }
        
        query += ` ORDER BY s.data DESC`;
        
        const result = await db.query(query, params);
        
        // Buscar itens para cada saída
        for (let saida of result.rows) {
            const itensResult = await db.query(
                `SELECT si.*, pr.nome as produto_nome
                 FROM saida_itens si
                 JOIN produtos pr ON pr.id = si.produto_id
                 WHERE si.saida_id = $1`,
                [saida.id]
            );
            saida.itens = itensResult.rows;
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar saídas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarSaida = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            `SELECT s.*, u.nome as responsavel_nome, d.nome as destino_nome
             FROM saidas s
             LEFT JOIN usuarios u ON u.id = s.responsavel_id
             LEFT JOIN destinos d ON d.id = s.destino_id
             WHERE s.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Saída não encontrada' });
        }
        
        const saida = result.rows[0];
        
        // Buscar itens
        const itensResult = await db.query(
            `SELECT si.*, pr.nome as produto_nome
             FROM saida_itens si
             JOIN produtos pr ON pr.id = si.produto_id
             WHERE si.saida_id = $1`,
            [id]
        );
        
        saida.itens = itensResult.rows;
        
        res.json(saida);
    } catch (error) {
        console.error('Erro ao buscar saída:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.criarSaida = async (req, res) => {
    const { data, destino_id, valor_total, valor_pago, forma_pagamento, data_recebimento, pago, observacao, itens } = req.body;
    
    if (!data || !valor_total || !itens || itens.length === 0) {
        return res.status(400).json({ erro: 'Data, valor total e itens são obrigatórios' });
    }
    
    try {
        // Inserir saída
        const saidaResult = await db.query(
            `INSERT INTO saidas (data, destino_id, responsavel_id, valor_total, valor_pago, forma_pagamento, data_recebimento, pago, observacao)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [data, destino_id, req.usuarioId, valor_total, valor_pago || 0, forma_pagamento, data_recebimento, pago || false, observacao]
        );
        
        const saida = saidaResult.rows[0];
        
        // Inserir itens e atualizar estoque
        let valorCalculado = 0;
        
        for (let item of itens) {
            // Buscar preço do produto
            const produtoResult = await db.query('SELECT valor_unitario FROM produtos WHERE id = $1', [item.produto_id]);
            
            if (produtoResult.rows.length === 0) {
                continue;
            }
            
            const valorUnitario = item.valor_unitario || produtoResult.rows[0].valor_unitario;
            const subtotal = item.quantidade * valorUnitario - (item.desconto || 0);
            valorCalculado += subtotal;
            
            // Inserir item
            await db.query(
                `INSERT INTO saida_itens (saida_id, produto_id, quantidade, valor_unitario, desconto)
                 VALUES ($1, $2, $3, $4, $5)`,
                [saida.id, item.produto_id, item.quantidade, valorUnitario, item.desconto || 0]
            );
            
            // Atualizar estoque (diminuir)
            await db.query(
                'UPDATE estoque SET quantidade = quantidade - $1, atualizado_em = CURRENT_TIMESTAMP WHERE produto_id = $2',
                [item.quantidade, item.produto_id]
            );
        }
        
        // Atualizar valor total calculado
        await db.query(
            'UPDATE saidas SET valor_total = $1 WHERE id = $2',
            [valorCalculado, saida.id]
        );
        
        saida.valor_total = valorCalculado;
        
        // Retornar saída com itens
        const itensResult = await db.query(
            `SELECT si.*, pr.nome as produto_nome
             FROM saida_itens si
             JOIN produtos pr ON pr.id = si.produto_id
             WHERE si.saida_id = $1`,
            [saida.id]
        );
        
        saida.itens = itensResult.rows;
        
        res.status(201).json(saida);
    } catch (error) {
        console.error('Erro ao criar saída:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarStatusPagamento = async (req, res) => {
    const { id } = req.params;
    const { pago, valor_pago, data_recebimento } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE saidas 
             SET pago = COALESCE($1, pago),
                 valor_pago = COALESCE($2, valor_pago),
                 data_recebimento = COALESCE($3, data_recebimento)
             WHERE id = $4 RETURNING *`,
            [pago, valor_pago, data_recebimento, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Saída não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.excluirSaida = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Buscar itens da saída
        const itensResult = await db.query(
            'SELECT produto_id, quantidade FROM saida_itens WHERE saida_id = $1',
            [id]
        );
        
        // Devolver itens ao estoque
        for (let item of itensResult.rows) {
            await db.query(
                'UPDATE estoque SET quantidade = quantidade + $1, atualizado_em = CURRENT_TIMESTAMP WHERE produto_id = $2',
                [item.quantidade, item.produto_id]
            );
        }
        
        // Excluir saída (itens são excluídos em cascade)
        const result = await db.query(
            'DELETE FROM saidas WHERE id = $1 RETURNING id',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Saída não encontrada' });
        }
        
        res.json({ mensagem: 'Saída excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir saída:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

