const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
const { Rifa, Bilhete, Participante, Usuario, Sorteio, Pagamento } = require('../models');
const { Op } = require('sequelize');

// Aplicar middleware de autenticação - comentado temporariamente
// router.use(authMiddleware);

// Dashboard - Estatísticas gerais
router.get('/', async (req, res) => {
    try {
        // Estatísticas gerais
        const totalRifas = await Rifa.count();
        const rifasAtivas = await Rifa.count({ where: { status: 'ativa' } });
        const rifasFinalizadas = await Rifa.count({ where: { status: 'encerrada' } });

        const totalParticipantes = await Participante.count();
        const participantesAtivos = await Participante.count({ where: { ativo: true } });

        const totalUsuarios = await Usuario.count();
        const usuariosAtivos = await Usuario.count({ where: { ativo: true } });

        const totalSorteios = await Sorteio.count();
        const premiosEntregues = 0;

        // Estatísticas financeiras
        const bilhetesPagos = await Bilhete.count({ where: { status: 'vendido' } });
        const bilhetesDisponiveis = await Bilhete.count({ where: { status: 'disponivel' } });
        const bilhetesReservados = await Bilhete.count({ where: { status: 'reservado' } });

        // Calcular valor total arrecadado
        const pagamentosConfirmados = await Pagamento.findAll({
            where: { status: 'confirmado' },
            attributes: ['valor']
        });

        const valorTotalArrecadado = pagamentosConfirmados.reduce(
            (total, pagamento) => total + parseFloat(pagamento.valor || 0), 0
        );

        // Estatísticas dos últimos 30 dias
        const ultimoMes = new Date();
        ultimoMes.setMonth(ultimoMes.getMonth() - 1);

        const rifasCriadasUltimoMes = await Rifa.count({
            where: { createdAt: { [Op.gte]: ultimoMes } }
        });

        const participantesCadastradosUltimoMes = await Participante.count({
            where: { createdAt: { [Op.gte]: ultimoMes } }
        });

        const vendas30Dias = await Pagamento.count({
            where: {
                status: 'confirmado',
                createdAt: { [Op.gte]: ultimoMes }
            }
        });

        // Buscar lista de rifas recentes
        const rifasRecentes = await Rifa.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'titulo', 'premio', 'dataInicio', 'dataFim', 'status', 'createdAt']
        });

        const dashboard = {
            estatisticasGerais: {
                totalRifas,
                rifasAtivas,
                rifasFinalizadas,
                totalParticipantes,
                participantesAtivos,
                totalUsuarios,
                usuariosAtivos,
                totalSorteios,
                premiosEntregues
            },
            estatisticasFinanceiras: {
                bilhetesPagos,
                bilhetesDisponiveis,
                bilhetesReservados,
                valorTotalArrecadado,
                ticketMedio: bilhetesPagos > 0 ? valorTotalArrecadado / bilhetesPagos : 0
            },
            ultimoMes: {
                rifasCriadas: rifasCriadasUltimoMes,
                participantesCadastrados: participantesCadastradosUltimoMes,
                vendas: vendas30Dias
            },
            rifasRecentes: rifasRecentes || []
        };

        res.status(200).json(dashboard);
    } catch (error) {
        console.error('❌ Erro ao obter dashboard:', error);
        res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
    }
});

// Relatório de vendas por período
router.get('/relatorio/vendas', async (req, res) => {
    try {
        const { dataInicio, dataFim, vendedorId, rifaId } = req.query;

        if (!dataInicio || !dataFim) {
            return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
        }

        let whereClause = {
            status: 'vendido',
            dataPagamento: {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            }
        };

        if (vendedorId) {
            whereClause.vendidoPor = vendedorId;
        }

        let rifaWhere = {};
        if (rifaId) {
            rifaWhere.id = rifaId;
        }

        const bilhetes = await Bilhete.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'numero', 'rifaId', 'participanteId', 'vendedorId', 'valor', 'status', 'dataVenda', 'createdAt']
        });

        // Calcular estatísticas
        const totalBilhetes = bilhetes.length;
        const valorTotal = bilhetes.reduce((sum, bilhete) => {
            return sum + parseFloat(bilhete.valorPago || bilhete.rifa.valorBilhete);
        }, 0);

        const porVendedor = bilhetes.reduce((acc, bilhete) => {
            const vendedorId = bilhete.vendidoPor;
            if (!acc[vendedorId]) {
                acc[vendedorId] = {
                    nome: bilhete.vendedor.nome,
                    quantidade: 0,
                    valor: 0,
                    comissao: 0
                };
            }
            const valor = parseFloat(bilhete.valorPago || bilhete.rifa.valorBilhete);
            acc[vendedorId].quantidade += 1;
            acc[vendedorId].valor += valor;
            acc[vendedorId].comissao += valor * (bilhete.vendedor.comissao / 100);
            return acc;
        }, {});

        const porRifa = bilhetes.reduce((acc, bilhete) => {
            const rifaId = bilhete.rifa.id;
            if (!acc[rifaId]) {
                acc[rifaId] = {
                    titulo: bilhete.rifa.titulo,
                    quantidade: 0,
                    valor: 0
                };
            }
            acc[rifaId].quantidade += 1;
            acc[rifaId].valor += parseFloat(bilhete.valorPago || bilhete.rifa.valorBilhete);
            return acc;
        }, {});

        const relatorio = {
            periodo: {
                inicio: dataInicio,
                fim: dataFim
            },
            resumo: {
                totalBilhetes,
                valorTotal,
                ticketMedio: totalBilhetes > 0 ? valorTotal / totalBilhetes : 0
            },
            porVendedor: Object.values(porVendedor),
            porRifa: Object.values(porRifa),
            bilhetes
        };

        res.status(200).json(relatorio);
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

module.exports = router;
