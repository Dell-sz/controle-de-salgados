const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas de produtos
router.get('/', produtoController.listarProdutos);
router.get('/estoque', produtoController.listarEstoque);
router.get('/:id', produtoController.buscarProduto);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

// Rotas de estoque
router.put('/:id/estoque', produtoController.atualizarEstoque);

module.exports = router;

