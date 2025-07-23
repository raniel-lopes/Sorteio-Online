const { Op } = require('sequelize');
const { Pagamento, Bilhete, Participante, Rifa, Usuario } = require('../models');

// Listar pagamentos
exports.getPagamentos = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'all',
            formaPagamento = 'all',
            rifaId,
            dataInicio,
            dataFim
        } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        // Filtros
        if (status !== 'all') {
            whereClause.status = status;
        }
        if (formaPagamento !== 'all') {
            whereClause.metodoPagamento = formaPagamento;
        }
        if (dataInicio && dataFim) {
            whereClause.dataPagamento = {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            };
        }

        const pagamentos = await Pagamento.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'bilheteId',
                'valor',
                'metodoPagamento',
                'status',
                'transacaoId',
                'dataPagamento',
                'observacoes',
                'createdAt',
                'updatedAt'
            ]
        });

        const total = await Pagamento.count({ where: whereClause });

        res.status(200).json({
            pagamentos,
            totalCount: total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
};

// Buscar pagamento por ID
exports.getPagamentoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const pagamento = await Pagamento.findByPk(id, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhete',
                    attributes: ['id', 'numero'],
                    include: [
                        {
                            model: Rifa,
                            as: 'rifa',
                            attributes: ['id', 'titulo', 'premio']
                        }
                    ]
                },
                {
                    model: Participante,
                    as: 'participante',
                    attributes: ['id', 'nomeCompleto', 'celular', 'email']
                },
                {
                    model: Usuario,
                    as: 'processador',
                    attributes: ['id', 'nome', 'usuario']
                }
            ]
        });

        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        res.status(200).json(pagamento);
    } catch (error) {
        console.error('❌ Erro ao buscar pagamento:', error);
        res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
};

// Confirmar pagamento
exports.confirmarPagamento = async (req, res) => {
    const { id } = req.params;
    const { codigoTransacao, observacoes } = req.body;
    const processadoPor = req.user.id;

    try {
        const pagamento = await Pagamento.findByPk(id);
        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (pagamento.status !== 'pendente') {
            return res.status(400).json({ error: 'Pagamento não está pendente' });
        }

        // Atualizar pagamento
        await pagamento.update({
            status: 'confirmado',
            dataPagamento: new Date(),
            codigoTransacao,
            observacoes,
            processadoPor
        });

        // Atualizar TODOS os bilhetes do participante como vendidos
        if (pagamento.participanteId) {
            // Se tem participanteId, atualizar todos os bilhetes do participante
            await Bilhete.update(
                {
                    status: 'vendido',
                    dataPagamento: new Date()
                },
                { where: { participanteId: pagamento.participanteId } }
            );
        } else if (pagamento.bilheteId) {
            // Se tem apenas bilheteId (sistema antigo), atualizar apenas esse bilhete
            await Bilhete.update(
                {
                    status: 'vendido',
                    dataPagamento: new Date()
                },
                { where: { id: pagamento.bilheteId } }
            );
        }

        res.status(200).json({
            message: 'Pagamento confirmado com sucesso',
            pagamento
        });
    } catch (error) {
        console.error('❌ Erro ao confirmar pagamento:', error);
        res.status(500).json({ error: 'Erro ao confirmar pagamento' });
    }
};

// Cancelar pagamento
exports.cancelarPagamento = async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;
    const processadoPor = req.user.id;

    try {
        const pagamento = await Pagamento.findByPk(id);
        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (pagamento.status === 'cancelado') {
            return res.status(400).json({ error: 'Pagamento já foi cancelado' });
        }

        // Atualizar pagamento
        await pagamento.update({
            status: 'cancelado',
            observacoes: `${pagamento.observacoes || ''} | Cancelado: ${motivo}`,
            processadoPor
        });

        // Atualizar bilhete como disponível
        await Bilhete.update(
            {
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
                vendidoPor: null
            },
            { where: { id: pagamento.bilheteId } }
        );

        res.status(200).json({
            message: 'Pagamento cancelado com sucesso',
            pagamento
        });
    } catch (error) {
        console.error('❌ Erro ao cancelar pagamento:', error);
        res.status(500).json({ error: 'Erro ao cancelar pagamento' });
    }
};

// Estornar pagamento
exports.estornarPagamento = async (req, res) => {
    const { id } = req.params;
    const { motivo, valorEstorno } = req.body;
    const processadoPor = req.user.id;

    try {
        const pagamento = await Pagamento.findByPk(id);
        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (pagamento.status !== 'confirmado') {
            return res.status(400).json({ error: 'Apenas pagamentos confirmados podem ser estornados' });
        }

        // Verificar se a rifa não foi sorteada
        const rifa = await Rifa.findByPk(pagamento.rifaId);
        if (rifa.status === 'finalizada') {
            return res.status(400).json({ error: 'Não é possível estornar pagamento de rifa finalizada' });
        }

        // Atualizar pagamento
        await pagamento.update({
            status: 'estornado',
            observacoes: `${pagamento.observacoes || ''} | Estorno: ${motivo}`,
            processadoPor
        });

        // Atualizar bilhete como disponível
        await Bilhete.update(
            {
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
                vendidoPor: null
            },
            { where: { id: pagamento.bilheteId } }
        );

        // Atualizar estatísticas do participante se existir
        if (pagamento.participanteId) {
            const participante = await Participante.findByPk(pagamento.participanteId);
            if (participante) {
                await participante.update({
                    totalBilhetes: Math.max(0, participante.totalBilhetes - 1),
                    totalGasto: Math.max(0, participante.totalGasto - pagamento.valorFinal)
                });
            }
        }

        res.status(200).json({
            message: 'Pagamento estornado com sucesso',
            pagamento
        });
    } catch (error) {
        console.error('❌ Erro ao estornar pagamento:', error);
        res.status(500).json({ error: 'Erro ao estornar pagamento' });
    }
};

// Relatório de pagamentos por período
exports.getRelatorioPagamentos = async (req, res) => {
    const { dataInicio, dataFim, rifaId } = req.query;

    try {
        if (!dataInicio || !dataFim) {
            return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
        }

        let whereClause = {
            dataPagamento: {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            },
            status: 'confirmado'
        };

        if (rifaId) {
            whereClause.rifaId = rifaId;
        }

        const pagamentos = await Pagamento.findAll({
            where: whereClause,
            include: [
                {
                    model: Rifa,
                    as: 'rifa',
                    attributes: ['id', 'titulo', 'premio']
                },
                {
                    model: Usuario,
                    as: 'processador',
                    attributes: ['id', 'nome', 'usuario']
                }
            ],
            order: [['dataPagamento', 'DESC']]
        });

        // Calcular estatísticas
        const totalPagamentos = pagamentos.length;
        const valorTotal = pagamentos.reduce((sum, p) => sum + parseFloat(p.valorFinal), 0);

        const porFormaPagamento = pagamentos.reduce((acc, p) => {
            acc[p.formaPagamento] = (acc[p.formaPagamento] || 0) + 1;
            return acc;
        }, {});

        const porRifa = pagamentos.reduce((acc, p) => {
            const rifaId = p.rifa.id;
            if (!acc[rifaId]) {
                acc[rifaId] = {
                    titulo: p.rifa.titulo,
                    quantidade: 0,
                    valor: 0
                };
            }
            acc[rifaId].quantidade += 1;
            acc[rifaId].valor += parseFloat(p.valorFinal);
            return acc;
        }, {});

        const relatorio = {
            periodo: {
                inicio: dataInicio,
                fim: dataFim
            },
            resumo: {
                totalPagamentos,
                valorTotal,
                ticketMedio: totalPagamentos > 0 ? valorTotal / totalPagamentos : 0
            },
            porFormaPagamento,
            porRifa: Object.values(porRifa),
            pagamentos
        };

        res.status(200).json(relatorio);
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

// Obter estatísticas de pagamentos
exports.getEstatisticasPagamentos = async (req, res) => {
    try {
        const totalPagamentos = await Pagamento.count();
        const pagamentosConfirmados = await Pagamento.count({
            where: { status: 'confirmado' }
        });
        const pagamentosPendentes = await Pagamento.count({
            where: { status: 'pendente' }
        });
        const pagamentosCancelados = await Pagamento.count({
            where: { status: 'cancelado' }
        });
        const pagamentosEstornados = await Pagamento.count({
            where: { status: 'estornado' }
        });

        // Valor total arrecadado
        const valorTotalResult = await Pagamento.findOne({
            where: { status: 'confirmado' },
            attributes: [[require('sequelize').fn('SUM', require('sequelize').col('valorFinal')), 'total']]
        });
        const valorTotal = parseFloat(valorTotalResult?.dataValues?.total || 0);

        // Pagamentos dos últimos 30 dias
        const pagamentosRecentes = await Pagamento.count({
            where: {
                status: 'confirmado',
                dataPagamento: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const estatisticas = {
            totalPagamentos,
            pagamentosConfirmados,
            pagamentosPendentes,
            pagamentosCancelados,
            pagamentosEstornados,
            valorTotal,
            pagamentosUltimos30Dias: pagamentosRecentes,
            taxaConfirmacao: totalPagamentos > 0 ? (pagamentosConfirmados / totalPagamentos) * 100 : 0
        };

        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
};
