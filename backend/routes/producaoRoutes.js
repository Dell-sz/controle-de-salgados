const express = require('express');
const router = express.Router();
const producaoController = require('../controllers/producaoController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

router.get('/', producaoController.listarProducoes);
router.get('/estatisticas', producaoController.getEstatisticasProducao);
router.get('/:id', producaoController.buscarProducao);
router.post('/', producaoController.criarProducao);
router.put('/:id', producaoController.atualizarProducao);
router.delete('/:id', producaoController.excluirProducao);

module.exports = router;

