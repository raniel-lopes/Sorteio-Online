const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rotas para o próprio usuário (perfil)
router.put('/me', authMiddleware, usuarioController.atualizarDados); // Atualizar dados pessoais
router.put('/me/senha', authMiddleware, usuarioController.atualizarSenha); // Atualizar senha

// Listar usuários (todos podem ver)
router.get('/', authMiddleware, usuarioController.getUsuarios);

// Buscar usuário por ID
router.get('/:id', authMiddleware, usuarioController.getUsuarioPorId);

// Obter estatísticas do usuário
router.get('/:id/estatisticas', authMiddleware, usuarioController.getEstatisticasUsuario);

// Ranking de vendedores
router.get('/ranking/vendedores', authMiddleware, usuarioController.getRankingVendedores);

// Apenas admin pode gerenciar usuários do sistema
router.post('/', authMiddleware, adminMiddleware, usuarioController.createUsuario);
router.put('/:id', authMiddleware, adminMiddleware, usuarioController.atualizarUsuario);
router.delete('/:id', authMiddleware, adminMiddleware, usuarioController.excluirUsuario);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, usuarioController.toggleUsuario);

module.exports = router;