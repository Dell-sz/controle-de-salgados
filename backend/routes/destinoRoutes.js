const express = require('express');
const router = express.Router();
const destinoController = require('../controllers/destinoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', destinoController.listarDestinos);
router.get('/categorias', destinoController.listarCategorias);
router.get('/:id', destinoController.buscarDestino);
router.post('/', destinoController.criarDestino);
router.put('/:id', destinoController.atualizarDestino);
router.delete('/:id', destinoController.deletarDestino);

module.exports = router;

