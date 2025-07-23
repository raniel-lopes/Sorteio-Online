const { Op } = require('sequelize');
const { Bilhete, Rifa, Participante, Usuario, Pagamento } = require('../models');

// Listar bilhetes de uma rifa
exports.getBilhetesPorRifa = async (req, res) => {
    const { rifaId } = req.params;
    const { status = 'all', page = 1, limit = 50 } = req.query;

    try {
        const offset = (page - 1) * limit;

        let whereClause = { rifaId };
        if (status !== 'all') {
            whereClause.status = status;
        }

        const bilhetes = await Bilhete.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Participante,
                    as: 'participante',
                    attributes: ['id', 'nomeCompleto', 'celular']
                },
                {
                    model: Usuario,
                    as: 'vendedor',
                    attributes: ['id', 'nome', 'usuario']
                },
                {
                    model: Pagamento,
                    as: 'pagamento'
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['numero', 'ASC']]
        });

        res.status(200).json({
            bilhetes: bilhetes.rows,
            totalCount: bilhetes.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bilhetes.count / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar bilhetes:', error);
        res.status(500).json({ error: 'Erro ao buscar bilhetes' });
    }
};

// Reservar bilhete
exports.reservarBilhete = async (req, res) => {
    const { rifaId, numero } = req.params;
    const { nomeComprador, celularComprador, emailComprador } = req.body;
    const vendidoPor = req.user.id;

    try {
        // Verificar se a rifa existe e está ativa
        const rifa = await Rifa.findByPk(rifaId);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        if (rifa.status !== 'ativa') {
            return res.status(400).json({ error: 'Rifa não está ativa' });
        }

        // Verificar se o bilhete existe e está disponível
        const bilhete = await Bilhete.findOne({
            where: { rifaId, numero, status: 'disponivel' }
        });

        if (!bilhete) {
            return res.status(400).json({ error: 'Bilhete não disponível' });
        }

        // Reservar o bilhete
        await bilhete.update({
            status: 'reservado',
            nomeComprador,
            celularComprador,
            emailComprador,
            dataCompra: new Date(),
            vendidoPor
        });

        res.status(200).json({
            message: 'Bilhete reservado com sucesso',
            bilhete
        });
    } catch (error) {
        console.error('❌ Erro ao reservar bilhete:', error);
        res.status(500).json({ error: 'Erro ao reservar bilhete' });
    }
};

// Vender bilhete (marcar como pago)
exports.venderBilhete = async (req, res) => {
    const { rifaId, numero } = req.params;
    const {
        nomeComprador,
        celularComprador,
        emailComprador,
        participanteId,
        formaPagamento,
        valorPago,
        codigoTransacao,
        observacoes
    } = req.body;
    const vendidoPor = req.user.id;

    try {
        // Verificar se a rifa existe e está ativa
        const rifa = await Rifa.findByPk(rifaId);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        if (rifa.status !== 'ativa') {
            return res.status(400).json({ error: 'Rifa não está ativa' });
        }

        // Verificar se o bilhete existe e está disponível ou reservado
        const bilhete = await Bilhete.findOne({
            where: {
                rifaId,
                numero,
                status: { [Op.in]: ['disponivel', 'reservado'] }
            }
        });

        if (!bilhete) {
            return res.status(400).json({ error: 'Bilhete não disponível' });
        }

        // Atualizar o bilhete como vendido
        await bilhete.update({
            status: 'pago',
            nomeComprador,
            celularComprador,
            emailComprador,
            participanteId,
            dataCompra: new Date(),
            dataPagamento: new Date(),
            formaPagamento,
            valorPago: valorPago || rifa.valorBilhete,
            codigoTransacao,
            observacoes,
            vendidoPor
        });

        // Criar registro de pagamento
        await Pagamento.create({
            bilheteId: bilhete.id,
            participanteId,
            rifaId,
            valor: valorPago || rifa.valorBilhete,
            formaPagamento,
            status: 'confirmado',
            dataPagamento: new Date(),
            codigoTransacao,
            observacoes,
            processadoPor: vendidoPor,
            numerosPagos: JSON.stringify([numero]),
            valorFinal: valorPago || rifa.valorBilhete
        });

        // Atualizar estatísticas da rifa
        const bilhetesVendidos = await Bilhete.count({
            where: { rifaId, status: 'pago' }
        });

        const totalArrecadado = bilhetesVendidos * rifa.valorBilhete;
        const percentualVendido = (bilhetesVendidos / rifa.quantidadeNumeros) * 100;

        await rifa.update({
            bilhetesVendidos,
            totalArrecadado,
            percentualVendido: Math.round(percentualVendido * 100) / 100
        });

        // Atualizar estatísticas do participante se existe
        if (participanteId) {
            const participante = await Participante.findByPk(participanteId);
            if (participante) {
                await participante.update({
                    totalBilhetes: participante.totalBilhetes + 1,
                    totalGasto: participante.totalGasto + (valorPago || rifa.valorBilhete)
                });
            }
        }

        res.status(200).json({
            message: 'Bilhete vendido com sucesso',
            bilhete
        });
    } catch (error) {
        console.error('❌ Erro ao vender bilhete:', error);
        res.status(500).json({ error: 'Erro ao vender bilhete' });
    }
};

// Cancelar reserva de bilhete
exports.cancelarReserva = async (req, res) => {
    const { rifaId, numero } = req.params;

    try {
        const bilhete = await Bilhete.findOne({
            where: { rifaId, numero, status: 'reservado' }
        });

        if (!bilhete) {
            return res.status(404).json({ error: 'Bilhete reservado não encontrado' });
        }

        await bilhete.update({
            status: 'disponivel',
            nomeComprador: null,
            celularComprador: null,
            emailComprador: null,
            participanteId: null,
            dataCompra: null,
            vendidoPor: null
        });

        res.status(200).json({
            message: 'Reserva cancelada com sucesso',
            bilhete
        });
    } catch (error) {
        console.error('❌ Erro ao cancelar reserva:', error);
        res.status(500).json({ error: 'Erro ao cancelar reserva' });
    }
};

// Estornar bilhete vendido
exports.estornarBilhete = async (req, res) => {
    const { rifaId, numero } = req.params;
    const { motivo } = req.body;

    try {
        const bilhete = await Bilhete.findOne({
            where: { rifaId, numero, status: 'pago' }
        });

        if (!bilhete) {
            return res.status(404).json({ error: 'Bilhete vendido não encontrado' });
        }

        // Verificar se a rifa não foi sorteada
        const rifa = await Rifa.findByPk(rifaId);
        if (rifa.status === 'finalizada') {
            return res.status(400).json({ error: 'Não é possível estornar bilhete de rifa finalizada' });
        }

        // Estornar pagamento
        const pagamento = await Pagamento.findOne({
            where: { bilheteId: bilhete.id }
        });

        if (pagamento) {
            await pagamento.update({
                status: 'estornado',
                observacoes: `${pagamento.observacoes ? pagamento.observacoes + ' | ' : ''}Estorno: ${motivo}`
            });
        }

        // Atualizar bilhete
        await bilhete.update({
            status: 'disponivel',
            nomeComprador: null,
            celularComprador: null,
            emailComprador: null,
            participanteId: null,
            dataCompra: null,
            dataPagamento: null,
            formaPagamento: null,
            valorPago: null,
            codigoTransacao: null,
            observacoes: `Estornado: ${motivo}`,
            vendidoPor: null
        });

        // Atualizar estatísticas da rifa
        const bilhetesVendidos = await Bilhete.count({
            where: { rifaId, status: 'pago' }
        });

        const totalArrecadado = bilhetesVendidos * rifa.valorBilhete;
        const percentualVendido = (bilhetesVendidos / rifa.quantidadeNumeros) * 100;

        await rifa.update({
            bilhetesVendidos,
            totalArrecadado,
            percentualVendido: Math.round(percentualVendido * 100) / 100
        });

        // Atualizar estatísticas do participante se existe
        if (bilhete.participanteId) {
            const participante = await Participante.findByPk(bilhete.participanteId);
            if (participante) {
                await participante.update({
                    totalBilhetes: Math.max(0, participante.totalBilhetes - 1),
                    totalGasto: Math.max(0, participante.totalGasto - (bilhete.valorPago || rifa.valorBilhete))
                });
            }
        }

        res.status(200).json({
            message: 'Bilhete estornado com sucesso',
            bilhete
        });
    } catch (error) {
        console.error('❌ Erro ao estornar bilhete:', error);
        res.status(500).json({ error: 'Erro ao estornar bilhete' });
    }
};

// Buscar bilhetes por participante
exports.getBilhetesPorParticipante = async (req, res) => {
    const { participanteId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    try {
        const offset = (page - 1) * limit;

        const bilhetes = await Bilhete.findAndCountAll({
            where: { participanteId },
            include: [
                {
                    model: Rifa,
                    as: 'rifa',
                    attributes: ['id', 'titulo', 'premio', 'valorBilhete', 'status']
                },
                {
                    model: Pagamento,
                    as: 'pagamento'
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['dataCompra', 'DESC']]
        });

        res.status(200).json({
            bilhetes: bilhetes.rows,
            totalCount: bilhetes.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(bilhetes.count / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar bilhetes do participante:', error);
        res.status(500).json({ error: 'Erro ao buscar bilhetes' });
    }
};

// Buscar números disponíveis de uma rifa
exports.getNumerosDisponiveis = async (req, res) => {
    const { rifaId } = req.params;

    try {
        const numerosDisponiveis = await Bilhete.findAll({
            where: { rifaId, status: 'disponivel' },
            attributes: ['numero'],
            order: [['numero', 'ASC']]
        });

        const numeros = numerosDisponiveis.map(b => b.numero);

        res.status(200).json({
            numerosDisponiveis: numeros,
            total: numeros.length
        });
    } catch (error) {
        console.error('❌ Erro ao buscar números disponíveis:', error);
        res.status(500).json({ error: 'Erro ao buscar números disponíveis' });
    }
};
