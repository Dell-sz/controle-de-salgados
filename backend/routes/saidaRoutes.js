const express = require('express');
const router = express.Router();
const saidaController = require('../controllers/saidaController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

router.get('/', saidaController.listarSaidas);
router.get('/:id', saidaController.buscarSaida);
router.post('/', saidaController.criarSaida);
router.put('/:id/status', saidaController.atualizarStatusPagamento);
router.delete('/:id', saidaController.excluirSaida);

module.exports = router;

