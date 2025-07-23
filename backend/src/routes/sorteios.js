const express = require('express');
const router = express.Router();
const sorteioController = require('../controllers/sorteioController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdminOrVendedor } = require('../middleware/profileMiddleware');

// Aplicar middleware de autenticação a todas as rotas - comentado temporariamente
// router.use(authMiddleware);

// Listar sorteios (todos podem ver)
router.get('/', sorteioController.getSorteios);

// Buscar sorteio por ID (todos podem ver)
router.get('/:id', sorteioController.getSorteioPorId);

// Buscar sorteio por rifa (todos podem ver)
router.get('/rifa/:rifaId', sorteioController.getSorteioPorRifa);

// Obter estatísticas gerais de sorteios (todos podem ver)
router.get('/estatisticas/geral', sorteioController.getEstatisticasSorteios);

// Realizar sorteio (apenas admin ou vendedor)
router.post('/:id/realizar', requireAdminOrVendedor, sorteioController.realizarSorteio);

// Confirmar entrega do prêmio (apenas admin ou vendedor)
router.patch('/:id/confirmar-entrega', requireAdminOrVendedor, sorteioController.confirmarEntregaPremio);

// Cancelar sorteio (apenas admin ou vendedor)
router.delete('/:id', requireAdminOrVendedor, sorteioController.cancelarSorteio);

module.exports = router;
