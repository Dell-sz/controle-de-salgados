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
            query += ` WHERE p.ativo = ?`;
            const result = db.all(query + ` ORDER BY p.nome`, [ativo === 'true' ? 1 : 0]);
            return res.json(result);
        }
        
        const result = db.all(query + ` ORDER BY p.nome`);
        res.json(result);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarProduto = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = db.get(
            `SELECT p.*, e.quantidade as estoque_atual, e.estoque_minimo, e.lote, e.data_validade
             FROM produtos p
             LEFT JOIN estoque e ON e.produto_id = p.id
             WHERE p.id = ?`,
            [id]
        );
        
        if (!result) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        res.json(result);
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
    
    try {
        // Inserir produto
        const result = db.exec(
            `INSERT INTO produtos (nome, descricao, valor_unitario, custo_massa, custo_recheio, ativo)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [nome, descricao || '', valor_unitario, custo_massa || 0, custo_recheio || 0]
        );
        
        // Pegar o último ID inserido
        const lastId = db.get('SELECT last_insert_rowid() as id');
        
        // Criar registro de estoque
        db.exec(
            `INSERT INTO estoque (produto_id, quantidade, estoque_minimo)
             VALUES (?, 0, ?)`,
            [lastId.id, estoque_minimo || 5]
        );
        
        // Retornar o produto criado
        const produto = db.get('SELECT * FROM produtos WHERE id = ?', [lastId.id]);
        
        res.status(201).json(produto);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ erro: 'Produto já cadastrado' });
        }
        
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarProduto = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, valor_unitario, custo_massa, custo_recheio, ativo } = req.body;
    
    try {
        // Verificar se existe
        const existente = db.get('SELECT id FROM produtos WHERE id = ?', [id]);
        if (!existente) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        // Atualizar apenas os campos fornecidos
        if (nome !== undefined) {
            db.exec('UPDATE produtos SET nome = ? WHERE id = ?', [nome, id]);
        }
        if (descricao !== undefined) {
            db.exec('UPDATE produtos SET descricao = ? WHERE id = ?', [descricao, id]);
        }
        if (valor_unitario !== undefined) {
            db.exec('UPDATE produtos SET valor_unitario = ? WHERE id = ?', [valor_unitario, id]);
        }
        if (custo_massa !== undefined) {
            db.exec('UPDATE produtos SET custo_massa = ? WHERE id = ?', [custo_massa, id]);
        }
        if (custo_recheio !== undefined) {
            db.exec('UPDATE produtos SET custo_recheio = ? WHERE id = ?', [custo_recheio, id]);
        }
        if (ativo !== undefined) {
            db.exec('UPDATE produtos SET ativo = ? WHERE id = ?', [ativo ? 1 : 0, id]);
        }
        
        const produto = db.get('SELECT * FROM produtos WHERE id = ?', [id]);
        res.json(produto);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.deletarProduto = async (req, res) => {
    const { id } = req.params;
    
    try {
        const existente = db.get('SELECT id FROM produtos WHERE id = ?', [id]);
        if (!existente) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        // Soft delete - apenas desativar
        db.exec('UPDATE produtos SET ativo = 0 WHERE id = ?', [id]);
        
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
        const produtoCheck = db.get('SELECT id FROM produtos WHERE id = ?', [id]);
        if (!produtoCheck) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        // Verificar se já tem estoque
        const estoqueExistente = db.get('SELECT id FROM estoque WHERE produto_id = ?', [id]);
        
        if (estoqueExistente) {
            // Atualizar
            if (quantidade !== undefined) {
                db.exec('UPDATE estoque SET quantidade = ? WHERE produto_id = ?', [quantidade, id]);
            }
            if (estoque_minimo !== undefined) {
                db.exec('UPDATE estoque SET estoque_minimo = ? WHERE produto_id = ?', [estoque_minimo, id]);
            }
            if (lote !== undefined) {
                db.exec('UPDATE estoque SET lote = ? WHERE produto_id = ?', [lote, id]);
            }
            if (data_validade !== undefined) {
                db.exec('UPDATE estoque SET data_validade = ? WHERE produto_id = ?', [data_validade, id]);
            }
        } else {
            // Criar
            db.exec(
                'INSERT INTO estoque (produto_id, quantidade, estoque_minimo, lote, data_validade) VALUES (?, ?, ?, ?, ?)',
                [id, quantidade || 0, estoque_minimo || 5, lote || null, data_validade || null]
            );
        }
        
        const estoque = db.get('SELECT * FROM estoque WHERE produto_id = ?', [id]);
        res.json(estoque);
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarEstoque = async (req, res) => {
    try {
        const result = db.all(
            `SELECT p.id, p.nome, p.valor_unitario, e.quantidade, e.estoque_minimo, e.lote, e.data_validade,
                    CASE WHEN e.quantidade <= e.estoque_minimo THEN 'baixo' ELSE 'ok' END as status_estoque
             FROM produtos p
             JOIN estoque e ON e.produto_id = p.id
             WHERE p.ativo = 1
             ORDER BY e.quantidade ASC, p.nome`
        );
        
        res.json(result);
    } catch (error) {
        console.error('Erro ao listar estoque:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

