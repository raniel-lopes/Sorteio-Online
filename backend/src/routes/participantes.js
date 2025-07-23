const express = require('express');
const router = express.Router();
const participanteController = require('../controllers/participanteController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Listar todos os participantes
router.get('/', participanteController.getParticipantes);

// Criar participante
router.post('/', participanteController.createParticipante);

// Buscar participante por ID
router.get('/:id', participanteController.getParticipantePorId);

// Atualizar participante
router.put('/:id', participanteController.atualizarParticipante);

// Excluir participante
router.delete('/:id', participanteController.excluirParticipante);

// Obter estatísticas do participante
router.get('/:id/estatisticas', participanteController.getEstatisticasParticipante);

module.exports = router;