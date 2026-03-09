const db = require('../config/database');

exports.listarProdutos = async (req, res) => {
    try {
        const { ativo } = req.query;
        
        let query = `
            SELECT p.*, e.quantidade as estoque_atual, e.estoque_minimo
            FROM produtos p
            LEFT JOIN estoque e ON e.produto_id = p.id
        `;
        
        if (ativo !== undefined) {
            query += ` WHERE p.ativo = $1`;
            const result = await db.query(query + ` ORDER BY p.nome`, [ativo === 'true']);
            return res.json(result.rows);
        }
        
        const result = await db.query(query + ` ORDER BY p.nome`);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarProduto = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            `SELECT p.*, e.quantidade as estoque_atual, e.estoque_minimo, e.lote, e.data_validade
             FROM produtos p
             LEFT JOIN estoque e ON e.produto_id = p.id
             WHERE p.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.criarProduto = async (req, res) => {
    const { nome, descricao, valor_unitario, custo_massa, custo_recheio, estoque_minimo } = req.body;
    
    if (!nome || valor_unitario === undefined) {
        return res.status(400).json({ erro: 'Nome e valor unitário são obrigatórios' });
    }
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Inserir produto
        const produtoResult = await client.query(
            `INSERT INTO produtos (nome, descricao, valor_unitario, custo_massa, custo_recheio)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [nome, descricao, valor_unitario, custo_massa || 0, custo_recheio || 0]
        );
        
        const produto = produtoResult.rows[0];
        
        // Criar registro de estoque
        await client.query(
            `INSERT INTO estoque (produto_id, quantidade, estoque_minimo)
             VALUES ($1, 0, $2)`,
            [produto.id, estoque_minimo || 5]
        );
        
        await client.query('COMMIT');
        
        res.status(201).json(produto);
    } catch (error) {
        await client.query('ROLLBACK');
        
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Produto já cadastrado' });
        }
        
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
};

exports.atualizarProduto = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, valor_unitario, custo_massa, custo_recheio, ativo } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE produtos 
             SET nome = COALESCE($1, nome),
                 descricao = COALESCE($2, descricao),
                 valor_unitario = COALESCE($3, valor_unitario),
                 custo_massa = COALESCE($4, custo_massa),
                 custo_recheio = COALESCE($5, custo_recheio),
                 ativo = COALESCE($6, ativo)
             WHERE id = $7 RETURNING *`,
            [nome, descricao, valor_unitario, custo_massa, custo_recheio, ativo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.deletarProduto = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Soft delete - apenas desativar
        const result = await db.query(
            `UPDATE produtos SET ativo = false WHERE id = $1 RETURNING id`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        res.json({ mensagem: 'Produto desativado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarEstoque = async (req, res) => {
    const { id } = req.params;
    const { quantidade, estoque_minimo, lote, data_validade } = req.body;
    
    try {
        // Verificar se produto existe
        const produtoCheck = await db.query('SELECT id FROM produtos WHERE id = $1', [id]);
        if (produtoCheck.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        const result = await db.query(
            `INSERT INTO estoque (produto_id, quantidade, estoque_minimo, lote, data_validade)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (produto_id) DO UPDATE SET
                quantidade = COALESCE($2, estoque.quantidade),
                estoque_minimo = COALESCE($3, estoque.estoque_minimo),
                lote = COALESCE($4, estoque.lote),
                data_validade = COALESCE($5, estoque.data_validade),
                atualizado_em = CURRENT_TIMESTAMP
             RETURNING *`,
            [id, quantidade, estoque_minimo, lote, data_validade]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarEstoque = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.id, p.nome, p.valor_unitario, e.quantidade, e.estoque_minimo, e.lote, e.data_validade,
                    CASE WHEN e.quantidade <= e.estoque_minimo THEN 'baixo' ELSE 'ok' END as status_estoque
             FROM produtos p
             JOIN estoque e ON e.produto_id = p.id
             WHERE p.ativo = true
             ORDER BY e.quantidade ASC, p.nome`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar estoque:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

