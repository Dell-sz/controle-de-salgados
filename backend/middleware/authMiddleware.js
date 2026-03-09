const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo_dev');
        req.usuarioId = decoded.id;
        req.usuarioTipo = decoded.tipo;
        req.usuarioNome = decoded.nome;
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
};

// Middleware para verificar se é admin
module.exports.requireAdmin = (req, res, next) => {
    if (req.usuarioTipo !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

// Middleware para verificar supervisor ou admin
module.exports.requireSupervisor = (req, res, next) => {
    if (req.usuarioTipo !== 'admin' && req.usuarioTipo !== 'supervisor') {
        return res.status(403).json({ erro: 'Acesso negado. Nível superior requerido.' });
    }
    next();
};

