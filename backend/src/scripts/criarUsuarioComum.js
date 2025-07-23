const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

(async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    await Usuario.create({
        nome: 'Usuário Comum',
        usuario: 'usuario',
        senha: senhaHash,
        perfil: 'usuario'
    });
    console.log('Usuário comum criado!');
    process.exit();
})();