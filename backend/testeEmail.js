// Teste do sistema de notificações por email
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { enviarEmail, criarEmailPagamentoAprovado } = require('../src/services/notificacaoService');

async function testarEmail() {
    console.log('🧪 Testando sistema de email...');

    // Dados de teste
    const dadosTeste = {
        participante: {
            nome: 'João Silva',
            email: 'teste@email.com', // Substitua por um email real para teste
            celular: '11999999999'
        },
        dadosPagamento: {
            rifaTitulo: 'Rifa Teste',
            quantidadeBilhetes: 3,
            numerosReservados: [15, 23, 47]
        },
        valor: 30.00
    };

    try {
        const { assunto, conteudoHtml } = criarEmailPagamentoAprovado(dadosTeste);

        console.log('📧 Enviando email de teste...');
        const resultado = await enviarEmail(dadosTeste.participante.email, assunto, conteudoHtml);

        if (resultado.sucesso) {
            console.log('✅ Email enviado com sucesso!');
            console.log('📧 Message ID:', resultado.messageId);
        } else {
            console.log('❌ Erro ao enviar email:', resultado.erro);
        }
    } catch (error) {
        console.error('💥 Erro no teste:', error.message);
        console.log('\n📝 Para configurar o email:');
        console.log('1. Configure EMAIL_USER e EMAIL_PASS no arquivo .env');
        console.log('2. Use uma conta Gmail com senha de app');
        console.log('3. Ative a verificação em 2 etapas no Gmail');
        console.log('4. Gere uma senha de app específica');
    }
}

// Executar o teste
testarEmail();
