const { Sorteio, Rifa, Bilhete } = require('../models');
const { Op } = require('sequelize');

// Listar todos os sorteios
exports.getSorteios = async (req, res) => {
    try {
        const sorteios = await Sorteio.findAll({
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'rifaId',
                'bilheteVencedorId',
                'dataSorteio',
                'numeroSorteado',
                'status',
                'observacoes',
                'createdAt',
                'updatedAt'
            ]
        });

        res.status(200).json(sorteios);
    } catch (error) {
        console.error('❌ Erro ao buscar sorteios:', error);
        res.status(500).json({
            error: 'Erro ao buscar sorteios',
            details: error.message
        });
    }
};

// Buscar sorteio por ID
exports.getSorteioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const sorteio = await Sorteio.findByPk(id);

        if (!sorteio) {
            return res.status(404).json({ error: 'Sorteio não encontrado' });
        }

        res.status(200).json(sorteio);
    } catch (error) {
        console.error('❌ Erro ao buscar sorteio:', error);
        res.status(500).json({
            error: 'Erro ao buscar sorteio',
            details: error.message
        });
    }
};

// Criar novo sorteio
exports.createSorteio = async (req, res) => {
    try {
        const { rifaId, dataSorteio, observacoes } = req.body;

        const sorteio = await Sorteio.create({
            rifaId,
            dataSorteio,
            numeroSorteado: null,
            bilheteVencedorId: null,
            status: 'agendado',
            observacoes
        });

        res.status(201).json(sorteio);
    } catch (error) {
        console.error('❌ Erro ao criar sorteio:', error);
        res.status(500).json({
            error: 'Erro ao criar sorteio',
            details: error.message
        });
    }
};

// Realizar sorteio
exports.realizarSorteio = async (req, res) => {
    try {
        const { id } = req.params;

        const sorteio = await Sorteio.findByPk(id);
        if (!sorteio) {
            return res.status(404).json({ error: 'Sorteio não encontrado' });
        }

        if (sorteio.status !== 'agendado') {
            return res.status(400).json({ error: 'Sorteio já foi realizado ou cancelado' });
        }

        // Buscar bilhetes pagos da rifa
        const bilhetesPagos = await Bilhete.findAll({
            where: {
                rifaId: sorteio.rifaId,
                status: 'pago'
            }
        });

        if (bilhetesPagos.length === 0) {
            return res.status(400).json({ error: 'Não há bilhetes pagos para realizar o sorteio' });
        }

        // Sortear um bilhete aleatório
        const bilheteVencedor = bilhetesPagos[Math.floor(Math.random() * bilhetesPagos.length)];

        // Atualizar o sorteio
        await sorteio.update({
            numeroSorteado: bilheteVencedor.numero,
            bilheteVencedorId: bilheteVencedor.id,
            status: 'realizado',
            dataSorteio: new Date()
        });

        res.status(200).json(sorteio);
    } catch (error) {
        console.error('❌ Erro ao realizar sorteio:', error);
        res.status(500).json({
            error: 'Erro ao realizar sorteio',
            details: error.message
        });
    }
};

// Cancelar sorteio
exports.cancelarSorteio = async (req, res) => {
    try {
        const { id } = req.params;

        const sorteio = await Sorteio.findByPk(id);
        if (!sorteio) {
            return res.status(404).json({ error: 'Sorteio não encontrado' });
        }

        if (sorteio.status === 'realizado') {
            return res.status(400).json({ error: 'Não é possível cancelar um sorteio já realizado' });
        }

        await sorteio.update({
            status: 'cancelado'
        });

        res.status(200).json(sorteio);
    } catch (error) {
        console.error('❌ Erro ao cancelar sorteio:', error);
        res.status(500).json({
            error: 'Erro ao cancelar sorteio',
            details: error.message
        });
    }
};

// Deletar sorteio
exports.deleteSorteio = async (req, res) => {
    try {
        const { id } = req.params;

        const sorteio = await Sorteio.findByPk(id);
        if (!sorteio) {
            return res.status(404).json({ error: 'Sorteio não encontrado' });
        }

        await sorteio.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar sorteio:', error);
        res.status(500).json({
            error: 'Erro ao deletar sorteio',
            details: error.message
        });
    }
};

// Buscar sorteio por rifa
exports.getSorteioPorRifa = async (req, res) => {
    try {
        const { rifaId } = req.params;
        const sorteios = await Sorteio.findAll({
            where: { rifaId },
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'rifaId',
                'bilheteVencedorId',
                'dataSorteio',
                'numeroSorteado',
                'status',
                'observacoes',
                'createdAt',
                'updatedAt'
            ]
        });

        res.status(200).json(sorteios);
    } catch (error) {
        console.error('❌ Erro ao buscar sorteios por rifa:', error);
        res.status(500).json({
            error: 'Erro ao buscar sorteios por rifa',
            details: error.message
        });
    }
};

// Obter estatísticas de sorteios
exports.getEstatisticasSorteios = async (req, res) => {
    try {
        const totalSorteios = await Sorteio.count();
        const sorteiosRealizados = await Sorteio.count({ where: { status: 'realizado' } });
        const sorteiosAgendados = await Sorteio.count({ where: { status: 'agendado' } });
        const sorteiosCancelados = await Sorteio.count({ where: { status: 'cancelado' } });

        const estatisticas = {
            total: totalSorteios,
            realizados: sorteiosRealizados,
            agendados: sorteiosAgendados,
            cancelados: sorteiosCancelados
        };

        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas de sorteios:', error);
        res.status(500).json({
            error: 'Erro ao buscar estatísticas de sorteios',
            details: error.message
        });
    }
};

// Confirmar entrega do prêmio
exports.confirmarEntregaPremio = async (req, res) => {
    try {
        const { id } = req.params;
        const { observacoes } = req.body;

        const sorteio = await Sorteio.findByPk(id);
        if (!sorteio) {
            return res.status(404).json({ error: 'Sorteio não encontrado' });
        }

        if (sorteio.status !== 'realizado') {
            return res.status(400).json({ error: 'Sorteio deve estar realizado para confirmar entrega' });
        }

        await sorteio.update({
            status: 'premio_entregue',
            observacoes: observacoes || sorteio.observacoes
        });

        res.status(200).json(sorteio);
    } catch (error) {
        console.error('❌ Erro ao confirmar entrega do prêmio:', error);
        res.status(500).json({
            error: 'Erro ao confirmar entrega do prêmio',
            details: error.message
        });
    }
};
