const db = require('../config/database');

exports.listarDestinos = async (req, res) => {
    try {
        const { ativo } = req.query;
        
        let query = `
            SELECT d.*, c.nome as categoria_nome, c.cor as categoria_cor
            FROM destinos d
            LEFT JOIN categorias_destino c ON c.id = d.categoria_id
        `;
        
        if (ativo !== undefined) {
            query += ` WHERE d.ativo = $1`;
            const result = await db.query(query + ` ORDER BY d.nome`, [ativo === 'true']);
            return res.json(result.rows);
        }
        
        const result = await db.query(query + ` ORDER BY d.nome`);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar destinos:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarDestino = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            `SELECT d.*, c.nome as categoria_nome, c.cor as categoria_cor
             FROM destinos d
             LEFT JOIN categorias_destino c ON c.id = d.categoria_id
             WHERE d.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Destino não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar destino:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.criarDestino = async (req, res) => {
    const { nome, categoria_id, endereco, contato, telefone, email } = req.body;
    
    if (!nome) {
        return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    try {
        const result = await db.query(
            `INSERT INTO destinos (nome, categoria_id, endereco, contato, telefone, email)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nome, categoria_id, endereco, contato, telefone, email]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar destino:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarDestino = async (req, res) => {
    const { id } = req.params;
    const { nome, categoria_id, endereco, contato, telefone, email, ativo } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE destinos 
             SET nome = COALESCE($1, nome),
                 categoria_id = COALESCE($2, categoria_id),
                 endereco = COALESCE($3, endereco),
                 contato = COALESCE($4, contato),
                 telefone = COALESCE($5, telefone),
                 email = COALESCE($6, email),
                 ativo = COALESCE($7, ativo)
             WHERE id = $8 RETURNING *`,
            [nome, categoria_id, endereco, contato, telefone, email, ativo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Destino não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar destino:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.deletarDestino = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            `UPDATE destinos SET ativo = false WHERE id = $1 RETURNING id`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Destino não encontrado' });
        }
        
        res.json({ mensagem: 'Destino desativado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar destino:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

// Categorias de destino
exports.listarCategorias = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM categorias_destino ORDER BY nome`);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

