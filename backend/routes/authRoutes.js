const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/login', authController.login);

// Rotas protegidas
router.post('/usuarios', authMiddleware, authMiddleware.requireAdmin, authController.criarUsuario);
router.get('/usuarios', authMiddleware, authMiddleware.requireSupervisor, authController.listarUsuarios);
router.put('/usuarios/:id', authMiddleware, authMiddleware.requireAdmin, authController.atualizarUsuario);
router.post('/usuarios/:id/senha', authMiddleware, authController.alterarSenha);

module.exports = router;

