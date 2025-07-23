const express = require('express');
const router = express.Router();
const { Participante, Bilhete, Rifa, Pagamento } = require('../models');

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

        res.json({
            ...participante.toJSON(),
            numerosReservados,
            quantidadeCotas,
            valorTotal,
            pagamentoId: pagamento.id
        });
    } catch (error) {
        console.error('Erro ao criar participante público:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
