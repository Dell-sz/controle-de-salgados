const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/vendas', relatorioController.getRelatorioVendas);
router.post('/vendas/filtrado', relatorioController.relatorioVendasFiltrado);
router.get('/producao', relatorioController.getRelatorioProducao);
router.get('/produtos', relatorioController.getRelatorioProdutos);
router.get('/grafico', relatorioController.getGraficoVendas);

module.exports = router;

