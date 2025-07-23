const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Pagamento, Participante, Rifa, Bilhete } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { enviarEmail, criarEmailPagamentoAprovado, criarEmailPagamentoRejeitado, enviarWhatsApp } = require('../services/notificacaoService');

// Configuração do multer para upload de comprovantes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/comprovantes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'comprovante-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas'));
        }
    }
});

// Rota pública para enviar comprovante
router.post('/comprovante', upload.single('comprovante'), async (req, res) => {
    try {
        const { participanteId } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Comprovante é obrigatório' });
        }

        // Verificar se o participante existe
        const participante = await Participante.findByPk(participanteId, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    include: [
                        {
                            model: Rifa,
                            as: 'rifa'
                        }
                    ]
                }
            ]
        });

        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }

        // Calcular valor total baseado nos bilhetes
        const valorTotal = participante.bilhetes.reduce((total, bilhete) => {
            return total + (parseFloat(bilhete.valor) || 0);
        }, 0);

        // Criar registro de pagamento
        const pagamento = await Pagamento.create({
            participanteId: participanteId,
            valor: valorTotal,
            metodoPagamento: 'pix',
            status: 'pendente',
            comprovanteUrl: `/uploads/comprovantes/${req.file.filename}`,
            dadosPagamento: {
                nomeArquivo: req.file.originalname,
                tamanhoArquivo: req.file.size
            }
        });

        res.json({
            message: 'Comprovante enviado com sucesso',
            pagamento: pagamento
        });
    } catch (error) {
        console.error('Erro ao enviar comprovante:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rotas protegidas (apenas admin)
router.use(authMiddleware);

// Listar pagamentos
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const pagamentos = await Pagamento.findAll({
            where,
            include: [
                {
                    model: Participante,
                    as: 'participante'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(pagamentos);
    } catch (error) {
        console.error('Erro ao listar pagamentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Aprovar pagamento
router.put('/:id/aprovar', async (req, res) => {
    try {
        const pagamento = await Pagamento.findByPk(req.params.id, {
            include: [{ model: Participante, as: 'participante' }]
        });

        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        // Atualizar status do pagamento
        await pagamento.update({
            status: 'aprovado',
            dataAprovacao: new Date()
        });

        // Atualizar status dos bilhetes para 'vendido'
        await Bilhete.update(
            { status: 'vendido' },
            {
                where: {
                    participanteId: pagamento.participanteId,
                    status: 'reservado'
                }
            }
        );

        // Enviar notificação para o cliente
        try {
            if (pagamento.participante?.email) {
                const { assunto, conteudoHtml } = criarEmailPagamentoAprovado({
                    participante: pagamento.participante,
                    dadosPagamento: pagamento.dadosPagamento,
                    valor: pagamento.valor
                });

                const resultadoEmail = await enviarEmail(pagamento.participante.email, assunto, conteudoHtml);

                if (resultadoEmail.sucesso) {
                    console.log(`� Email de aprovação enviado para ${pagamento.participante.nome}: ${resultadoEmail.messageId}`);
                } else {
                    console.error('Erro ao enviar email:', resultadoEmail.erro);
                }
            } else {
                console.log(`⚠️ Participante ${pagamento.participante.nome} não tem email cadastrado`);
            }
        } catch (notificacaoError) {
            console.error('Erro ao enviar notificação:', notificacaoError);
            // Não interrompe o processo de aprovação se a notificação falhar
        }

        res.json({
            message: 'Pagamento aprovado com sucesso',
            pagamento
        });
    } catch (error) {
        console.error('Erro ao aprovar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rejeitar pagamento
router.put('/:id/rejeitar', async (req, res) => {
    try {
        const { motivo } = req.body;
        const pagamento = await Pagamento.findByPk(req.params.id, {
            include: [{ model: Participante, as: 'participante' }]
        });

        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        // Atualizar status do pagamento
        await pagamento.update({
            status: 'rejeitado',
            motivoRejeicao: motivo,
            dataRejeicao: new Date()
        });

        // Liberar os bilhetes (voltar para disponível)
        await Bilhete.update(
            {
                status: 'disponivel',
                participanteId: null
            },
            {
                where: {
                    participanteId: pagamento.participanteId,
                    status: 'reservado'
                }
            }
        );

        // Enviar notificação para o cliente
        try {
            if (pagamento.participante?.email) {
                const { assunto, conteudoHtml } = criarEmailPagamentoRejeitado({
                    participante: pagamento.participante,
                    dadosPagamento: pagamento.dadosPagamento
                }, motivo);

                const resultadoEmail = await enviarEmail(pagamento.participante.email, assunto, conteudoHtml);

                if (resultadoEmail.sucesso) {
                    console.log(`� Email de rejeição enviado para ${pagamento.participante.nome}: ${resultadoEmail.messageId}`);
                } else {
                    console.error('Erro ao enviar email:', resultadoEmail.erro);
                }
            } else {
                console.log(`⚠️ Participante ${pagamento.participante.nome} não tem email cadastrado`);
            }
        } catch (notificacaoError) {
            console.error('Erro ao enviar notificação de rejeição:', notificacaoError);
            // Não interrompe o processo de rejeição se a notificação falhar
        }

        res.json({
            message: 'Pagamento rejeitado',
            pagamento
        });
    } catch (error) {
        console.error('Erro ao rejeitar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar pagamento por ID
router.get('/:id', async (req, res) => {
    try {
        const pagamento = await Pagamento.findByPk(req.params.id, {
            include: [
                {
                    model: Participante,
                    as: 'participante',
                    include: [
                        {
                            model: Bilhete,
                            as: 'bilhetes',
                            include: [
                                {
                                    model: Rifa,
                                    as: 'rifa'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        res.json(pagamento);
    } catch (error) {
        console.error('Erro ao buscar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
