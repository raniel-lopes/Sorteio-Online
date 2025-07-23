// Script para limpar dados do banco para deploy
const sequelize = require('./src/config/database');

async function cleanDatabase() {
    try {
        console.log('🧹 Iniciando limpeza do banco de dados...');

        // Limpar tabelas na ordem correta (respeitando foreign keys)
        await sequelize.query('DELETE FROM "Pagamentos"');
        console.log('✅ Pagamentos removidos');

        await sequelize.query('DELETE FROM "Bilhetes"');
        console.log('✅ Bilhetes removidos');

        await sequelize.query('DELETE FROM "Participantes"');
        console.log('✅ Participantes removidos');

        await sequelize.query('DELETE FROM "Rifas"');
        console.log('✅ Rifas removidas');

        // Manter apenas 1 usuário admin
        await sequelize.query(`
            DELETE FROM "Usuarios" 
            WHERE email != 'admin@admin.com'
        `);
        console.log('✅ Usuários limpos (mantido apenas admin)');

        // Reset das sequences
        await sequelize.query('ALTER SEQUENCE "Rifas_id_seq" RESTART WITH 1');
        await sequelize.query('ALTER SEQUENCE "Participantes_id_seq" RESTART WITH 1');
        await sequelize.query('ALTER SEQUENCE "Bilhetes_id_seq" RESTART WITH 1');
        await sequelize.query('ALTER SEQUENCE "Pagamentos_id_seq" RESTART WITH 1');
        console.log('✅ IDs resetados');

        console.log('🎉 Banco de dados limpo com sucesso!');
        console.log('📝 Sistema pronto para deploy com:');
        console.log('   - Usuário admin: admin@admin.com / senha: admin123');
        console.log('   - Banco limpo para novos dados');

    } catch (error) {
        console.error('❌ Erro ao limpar banco:', error);
    } finally {
        await sequelize.close();
    }
}

cleanDatabase();
