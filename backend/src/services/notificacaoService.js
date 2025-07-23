/**
 * Módulo de notificações
 * Responsável por enviar notificações para os clientes via email
 */

const nodemailer = require('nodemailer');

// Configuração do transportador de email
const criarTransportador = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'seu-email@gmail.com', // Configure no .env
            pass: process.env.EMAIL_PASS || 'sua-senha-app'        // Use senha de app do Gmail
        }
    });
};

// Função para enviar email
const enviarEmail = async (destinatario, assunto, conteudoHtml) => {
    try {
        const transporter = criarTransportador();

        const opcoes = {
            from: process.env.EMAIL_USER || 'seu-email@gmail.com',
            to: destinatario,
            subject: assunto,
            html: conteudoHtml
        };

        const resultado = await transporter.sendMail(opcoes);

        console.log(`� Email enviado para ${destinatario}: ${resultado.messageId}`);

        return {
            sucesso: true,
            messageId: resultado.messageId,
            mensagem: 'Email enviado com sucesso'
        };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
};

// Função para criar email de pagamento aprovado
const criarEmailPagamentoAprovado = (dadosPagamento) => {
    const { participante, dadosPagamento: dados, valor } = dadosPagamento;

    const assunto = '🎉 Pagamento Aprovado - Seus bilhetes estão confirmados!';

    const conteudoHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Pagamento Aprovado</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-icon { font-size: 48px; margin-bottom: 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
                .numbers { background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
                .btn-whatsapp { background: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">🎉</div>
                    <h1>PAGAMENTO APROVADO!</h1>
                    <p>Parabéns! Seus bilhetes estão confirmados</p>
                </div>
                
                <div class="content">
                    <p>Olá <strong>${participante.nome}</strong>,</p>
                    
                    <p>Temos uma ótima notícia! Seu pagamento foi aprovado com sucesso e seus bilhetes já estão confirmados para o sorteio! ✅</p>
                    
                    <div class="details">
                        <h3>📋 Detalhes da sua compra:</h3>
                        <div class="detail-row">
                            <span><strong>🎯 Rifa:</strong></span>
                            <span>${dados.rifaTitulo}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>🎫 Quantidade:</strong></span>
                            <span>${dados.quantidadeBilhetes} bilhete(s)</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>💰 Valor:</strong></span>
                            <span>R$ ${Number(valor).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="numbers">
                        <h3>🔢 Seus números da sorte:</h3>
                        <h2 style="color: #1976d2;">${dados.numerosReservados.join(', ')}</h2>
                    </div>
                    
                    <p><strong>🍀 Agora é só aguardar o sorteio e torcer para a sorte estar do seu lado!</strong></p>
                    
                    <p>Mantenha este email como comprovante da sua participação.</p>
                    
                    ${participante.celular ? `
                    <p>Caso tenha dúvidas, entre em contato conosco:</p>
                    <a href="https://wa.me/55${participante.celular.replace(/\D/g, '')}?text=Olá! Tenho uma dúvida sobre minha participação na rifa ${dados.rifaTitulo}" class="btn-whatsapp">
                        💬 Falar no WhatsApp
                    </a>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p>🎊 Boa sorte no sorteio!</p>
                    <p><small>Este é um email automático, não responda diretamente.</small></p>
                </div>
            </div>
        </body>
        </html>
    `;

    return { assunto, conteudoHtml };
};

// Função para criar email de pagamento rejeitado
const criarEmailPagamentoRejeitado = (dadosPagamento, motivo) => {
    const { participante, dadosPagamento: dados } = dadosPagamento;

    const assunto = '❌ Pagamento Rejeitado - Ação necessária';

    const conteudoHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Pagamento Rejeitado</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .warning-icon { font-size: 48px; margin-bottom: 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
                .motivo { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
                .btn-action { background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 15px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="warning-icon">❌</div>
                    <h1>PAGAMENTO REJEITADO</h1>
                    <p>Seu comprovante precisa de correção</p>
                </div>
                
                <div class="content">
                    <p>Olá <strong>${participante.nome}</strong>,</p>
                    
                    <p>Infelizmente, não conseguimos aprovar seu pagamento para a rifa.</p>
                    
                    <div class="motivo">
                        <h3>📝 Motivo da rejeição:</h3>
                        <p><strong>${motivo}</strong></p>
                    </div>
                    
                    <div class="details">
                        <h3>📋 Detalhes da tentativa:</h3>
                        <p><strong>🎯 Rifa:</strong> ${dados.rifaTitulo}</p>
                        <p><strong>🎫 Quantidade:</strong> ${dados.quantidadeBilhetes} bilhete(s)</p>
                    </div>
                    
                    <p><strong>🔄 O que fazer agora?</strong></p>
                    <ol>
                        <li>Verifique se o comprovante está legível e completo</li>
                        <li>Confirme se o valor pago está correto</li>
                        <li>Faça uma nova reserva e envie o comprovante correto</li>
                    </ol>
                    
                    <p>Para participar novamente, faça uma nova reserva em nosso site.</p>
                    
                    ${participante.celular ? `
                    <p>Em caso de dúvidas, entre em contato conosco:</p>
                    <a href="https://wa.me/55${participante.celular.replace(/\D/g, '')}?text=Olá! Preciso de ajuda com meu pagamento rejeitado para a rifa ${dados.rifaTitulo}" class="btn-action">
                        💬 Falar no WhatsApp
                    </a>
                    ` : ''}
                    
                    <a href="#" class="btn-action">🎯 Fazer Nova Reserva</a>
                </div>
                
                <div class="footer">
                    <p>Estamos aqui para ajudar! 💪</p>
                    <p><small>Este é um email automático, não responda diretamente.</small></p>
                </div>
            </div>
        </body>
        </html>
    `;

    return { assunto, conteudoHtml };
};

// Manter função do WhatsApp para uso manual (opcional)
const enviarWhatsApp = (celular, mensagem) => {
    try {
        const celularLimpo = celular.replace(/\D/g, '');
        let celularFormatado = celularLimpo;

        if (celularLimpo.length === 11 && celularLimpo.startsWith('0')) {
            celularFormatado = celularLimpo.substring(1);
        }
        if (celularLimpo.length === 10) {
            celularFormatado = celularLimpo.substring(0, 2) + '9' + celularLimpo.substring(2);
        }
        if (!celularFormatado.startsWith('55')) {
            celularFormatado = '55' + celularFormatado;
        }

        const linkWhatsApp = `https://wa.me/${celularFormatado}?text=${encodeURIComponent(mensagem)}`;

        return {
            sucesso: true,
            link: linkWhatsApp,
            celular: celularFormatado
        };
    } catch (error) {
        return {
            sucesso: false,
            erro: error.message
        };
    }
};

module.exports = {
    enviarEmail,
    criarEmailPagamentoAprovado,
    criarEmailPagamentoRejeitado,
    enviarWhatsApp // Manter para uso manual
};
