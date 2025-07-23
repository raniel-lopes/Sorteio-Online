const express = require('express');
const router = express.Router();
const bilheteController = require('../controllers/bilheteController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdminOrVendedor } = require('../middleware/profileMiddleware');

// Aplicar middleware de autenticação a todas as rotas - comentado temporariamente
// router.use(authMiddleware);

// Listar bilhetes de uma rifa (todos podem ver)
router.get('/rifa/:rifaId', bilheteController.getBilhetesPorRifa);

// Obter números disponíveis de uma rifa (todos podem ver)
router.get('/rifa/:rifaId/disponiveis', bilheteController.getNumerosDisponiveis);

// Buscar bilhetes por participante (todos podem ver)
router.get('/participante/:participanteId', bilheteController.getBilhetesPorParticipante);

// Reservar bilhete (apenas admin ou vendedor)
router.post('/rifa/:rifaId/numero/:numero/reservar', requireAdminOrVendedor, bilheteController.reservarBilhete);

// Vender bilhete (apenas admin ou vendedor)
router.post('/rifa/:rifaId/numero/:numero/vender', requireAdminOrVendedor, bilheteController.venderBilhete);

// Cancelar reserva de bilhete (apenas admin ou vendedor)
router.delete('/rifa/:rifaId/numero/:numero/cancelar-reserva', requireAdminOrVendedor, bilheteController.cancelarReserva);

// Estornar bilhete vendido (apenas admin ou vendedor)
router.post('/rifa/:rifaId/numero/:numero/estornar', requireAdminOrVendedor, bilheteController.estornarBilhete);

// Listar bilhetes recentes (para dashboard)
router.get('/', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const { Bilhete } = require('../models');
        const bilhetes = await Bilhete.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const total = await Bilhete.count();

        res.json({
            bilhetes,
            totalCount: total
        });
    } catch (error) {
        console.error('Erro ao buscar bilhetes:', error);
        res.status(500).json({ error: 'Erro ao buscar bilhetes' });
    }
});

module.exports = router;
