// Salve como scripts/criarAdmin.js e execute com: node scripts/criarAdmin.js
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

(async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    await Usuario.create({
        nome: 'Administrador',
        usuario: 'admin',
        senha: senhaHash,
        perfil: 'admin'
    });
    console.log('Usuário admin criado!');
    process.exit();
})();