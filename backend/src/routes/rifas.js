const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const rifaController = require('../controllers/rifaController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { requireAdminOrVendedor } = require('../middleware/profileMiddleware');

// Configuração do multer para upload de imagens das rifas
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/rifas/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'rifa-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Aplicar middleware de autenticação a todas as rotas - comentado temporariamente
// router.use(authMiddleware);

// Listar todas as rifas (todos podem ver)
router.get('/', rifaController.getRifas);

// Buscar rifa por ID (todos podem ver)
router.get('/:id', rifaController.getRifaPorId);

// Buscar participantes de uma rifa específica
router.get('/:id/participantes', rifaController.getParticipantesRifa);

// Obter estatísticas da rifa (todos podem ver)
router.get('/:id/estatisticas', rifaController.getEstatisticasRifa);

// Criar nova rifa (apenas admin ou vendedor) - com upload de imagem
router.post('/', upload.single('imagem'), rifaController.createRifa);

// Atualizar rifa (apenas admin ou vendedor) - com upload de imagem
router.put('/:id', upload.single('imagem'), rifaController.atualizarRifa);

// Excluir rifa (apenas admin ou vendedor)
router.delete('/:id', rifaController.excluirRifa);

// Pausar/Reativar rifa (apenas admin ou vendedor)
router.patch('/:id/toggle-status', rifaController.toggleStatusRifa);

module.exports = router;
