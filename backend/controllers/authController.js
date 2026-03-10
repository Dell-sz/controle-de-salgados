const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    try {
        const stmt = db.db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1');
        const usuario = stmt.get(email);
        
        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });
        }
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha inválida' });
        }
        
        // Atualizar último acesso
        const updateStmt = db.db.prepare('UPDATE usuarios SET ultimo_acesso = datetime("now") WHERE id = ?');
        updateStmt.run(usuario.id);
        
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                tipo: usuario.tipo,
                nome: usuario.nome
            },
            process.env.JWT_SECRET || 'segredo_dev',
            { expiresIn: '8h' }
        );
        
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.criarUsuario = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    const tipoValido = ['admin', 'supervisor', 'operador'];
    const tipoUsuario = tipo || 'operador';
    
    if (!tipoValido.includes(tipoUsuario)) {
        return res.status(400).json({ erro: 'Tipo de usuário inválido' });
    }
    
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const result = await db.query(
            `INSERT INTO usuarios (nome, email, senha, tipo) 
             VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo, ativo, criado_em`,
            [nome, email, senhaHash, tipoUsuario]
        );
        
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, nome, email, tipo, ativo, criado_em, ultimo_acesso 
             FROM usuarios ORDER BY nome`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, tipo, ativo } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE usuarios SET nome = COALESCE($1, nome), tipo = COALESCE($2, tipo), ativo = COALESCE($3, ativo)
             WHERE id = $4 RETURNING id, nome, email, tipo, ativo`,
            [nome, tipo, ativo, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.alterarSenha = async (req, res) => {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    
    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
    }
    
    try {
        // Buscar usuário
        const userResult = await db.query('SELECT senha FROM usuarios WHERE id = $1', [id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        // Verificar senha atual
        const senhaValida = await bcrypt.compare(senhaAtual, userResult.rows[0].senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha atual incorreta' });
        }
        
        // Atualizar senha
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [novaSenhaHash, id]);
        
        res.json({ mensagem: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

