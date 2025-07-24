require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Usuario } = require('./src/models');

(async () => {
    try {
        console.log('🔍 Verificando usuário admin...');

        // Procurar usuário admin existente
        const adminExistente = await Usuario.findOne({
            where: { usuario: 'prsergioadmin' }
        });

        if (adminExistente) {
            console.log('✅ Usuário prsergioadmin já existe!');
            console.log('📋 Dados atuais:', {
                nome: adminExistente.nome,
                usuario: adminExistente.usuario,
                perfil: adminExistente.perfil
            });
        } else {
            // Criar novo usuário admin
            console.log('🔧 Criando usuário prsergioadmin...');
            const senhaHash = await bcrypt.hash('Picole12!', 10);

            const novoAdmin = await Usuario.create({
                nome: 'Sérgio Administrador',
                usuario: 'prsergioadmin',
                senha: senhaHash,
                perfil: 'admin',
                telefone: '(11) 99999-9999'
            });

            console.log('✅ Usuário admin criado com sucesso!');
            console.log('📋 Credenciais:', {
                usuario: 'prsergioadmin',
                senha: 'Picole12!',
                perfil: 'admin'
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
})();
