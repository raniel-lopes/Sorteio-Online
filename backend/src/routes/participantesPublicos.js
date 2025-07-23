const express = require('express');
const router = express.Router();
const { Participante, Bilhete, Rifa, Pagamento } = require('../models');
const notificacaoService = require('../services/notificacaoService');

// Rota pública para criar participante (sem autenticação)
router.post('/participantes', async (req, res) => {
    try {
        const {
            nome,
            celular,
            email,
            cpf,
            rifaId,
            quantidadeCotas,
            numerosReservados,
            valorTotal,
            status
        } = req.body;

        if (!nome || !celular || !rifaId) {
            return res.status(400).json({ error: 'Nome, celular e rifaId são obrigatórios' });
        }

        // Verificar se a rifa existe
        const rifa = await Rifa.findByPk(rifaId);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        // Verificar se já existe um participante com o mesmo celular
        let participante = await Participante.findOne({
            where: {
                celular: celular
            }
        });

        if (!participante) {
            // Criar novo participante
            participante = await Participante.create({
                nome: nome,
                celular,
                email,
                cpf
            });
        } else {
            // Se encontrou um participante existente, atualizar dados se necessário
            let dadosAtualizados = false;

            if (participante.nome !== nome) {
                participante.nome = nome;
                dadosAtualizados = true;
            }

            if (email && participante.email !== email) {
                // Verificar se o novo email já existe em outro participante
                const emailExistente = await Participante.findOne({
                    where: {
                        email: email,
                        id: { [require('sequelize').Op.ne]: participante.id } // Excluir o próprio participante
                    }
                });

                if (emailExistente) {
                    return res.status(400).json({
                        error: 'Este email já está sendo usado por outro participante'
                    });
                }

                participante.email = email;
                dadosAtualizados = true;
            }

            if (cpf && participante.cpf !== cpf) {
                participante.cpf = cpf;
                dadosAtualizados = true;
            }

            if (dadosAtualizados) {
                await participante.save();
            }
        }

        // Verificar se os números estão disponíveis e criar bilhetes se necessário
        const bilhetesOcupados = await Bilhete.findAll({
            where: {
                rifaId: rifaId,
                numero: numerosReservados,
                status: ['reservado', 'vendido']
            }
        });

        if (bilhetesOcupados.length > 0) {
            return res.status(400).json({
                error: 'Alguns números já estão ocupados',
                numerosOcupados: bilhetesOcupados.map(b => b.numero)
            });
        }

        // Criar ou atualizar os bilhetes
        const bilhetesParaCriar = [];
        for (const numero of numerosReservados) {
            const bilheteExistente = await Bilhete.findOne({
                where: { rifaId: rifaId, numero: numero }
            });

            if (!bilheteExistente) {
                bilhetesParaCriar.push({
                    rifaId: rifaId,
                    numero: numero,
                    participanteId: participante.id,
                    valor: rifa.valorBilhete,
                    status: status || 'reservado'
                });
            }
        }

        // Criar os novos bilhetes se necessário
        if (bilhetesParaCriar.length > 0) {
            await Bilhete.bulkCreate(bilhetesParaCriar);
        }

        // Atualizar bilhetes existentes que estão livres
        await Bilhete.update(
            {
                participanteId: participante.id,
                valor: rifa.valorBilhete,
                status: status || 'reservado'
            },
            {
                where: {
                    rifaId: rifaId,
                    numero: numerosReservados,
                    status: 'disponivel'
                }
            }
        );

        // Criar pagamento pendente automaticamente
        const pagamento = await Pagamento.create({
            participanteId: participante.id,
            valor: valorTotal || (numerosReservados.length * rifa.valorBilhete),
            metodoPagamento: 'pix',
            status: 'pendente',
            dadosPagamento: {
                rifaId: rifaId,
                rifaTitulo: rifa.titulo,
                quantidadeBilhetes: numerosReservados.length,
                numerosReservados: numerosReservados,
                dataReserva: new Date()
            }
        });

        console.log(`💳 Pagamento pendente criado para ${nome} - Valor: R$ ${valorTotal || (numerosReservados.length * rifa.valorBilhete)}`);

        // 📧 ENVIAR EMAIL DE RESERVA (INFORMATIVO)
        try {
            if (participante.email) {
                const emailData = notificacaoService.criarEmailPagamentoAprovado({
                    participante: {
                        nome: participante.nome,
                        email: participante.email,
                        celular: participante.celular
                    },
                    dadosPagamento: {
                        rifaTitulo: rifa.titulo,
                        quantidadeBilhetes: numerosReservados.length,
                        numerosReservados: numerosReservados
                    },
                    valor: valorTotal || (numerosReservados.length * rifa.valorBilhete)
                });

                // Personalizar assunto para reserva
                const assuntoReserva = '🎫 Reserva Confirmada - Aguardando Pagamento';

                await notificacaoService.enviarEmail(
                    participante.email,
                    assuntoReserva,
                    emailData.conteudoHtml
                );

                console.log(`📧 Email de reserva enviado para ${participante.email}`);
            }
        } catch (emailError) {
            console.error('⚠️ Erro ao enviar email de reserva:', emailError.message);
            // Não falhar a operação se o email falhar
        }

        res.json({
            ...participante.toJSON(),
            numerosReservados,
            quantidadeCotas,
            valorTotal,
            pagamentoId: pagamento.id
        });
    } catch (error) {
        console.error('Erro ao criar participante público:', error);

        // Tratamento específico para erros de constraint única
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.errors && error.errors[0] && error.errors[0].path === 'email') {
                return res.status(400).json({
                    error: 'Este email já está sendo usado por outro participante'
                });
            }
            return res.status(400).json({
                error: 'Dados duplicados. Verifique se as informações já não foram cadastradas.'
            });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
