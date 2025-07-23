const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas - comentado temporariamente
// router.use(authMiddleware);

// Listar pagamentos
router.get('/', pagamentoController.getPagamentos);

// Buscar pagamento por ID
router.get('/:id', pagamentoController.getPagamentoPorId);

// Confirmar pagamento
router.patch('/:id/confirmar', pagamentoController.confirmarPagamento);

// Cancelar pagamento
router.patch('/:id/cancelar', pagamentoController.cancelarPagamento);

// Estornar pagamento
router.patch('/:id/estornar', pagamentoController.estornarPagamento);

// Relatório de pagamentos por período
router.get('/relatorio/periodo', pagamentoController.getRelatorioPagamentos);

// Obter estatísticas de pagamentos
router.get('/estatisticas/geral', pagamentoController.getEstatisticasPagamentos);

module.exports = router;
