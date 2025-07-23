const { Op } = require('sequelize');
const { Rifa, Bilhete, Participante, Usuario, Sorteio, Pagamento } = require('../models');

// Criar uma nova rifa
exports.createRifa = async (req, res) => {
    try {
        const { titulo, descricao, premio, valorBilhete, quantidadeNumeros, dataInicio, dataFim } = req.body;

        // Validações básicas
        if (!titulo || !premio || !valorBilhete || !quantidadeNumeros || !dataInicio || !dataFim) {
            return res.status(400).json({ error: 'Campos obrigatórios: título, prêmio, valor do bilhete, quantidade de números, data início e fim' });
        }

        if (new Date(dataInicio) >= new Date(dataFim)) {
            return res.status(400).json({ error: 'Data de início deve ser anterior à data de fim' });
        }

        if (quantidadeNumeros < 10 || quantidadeNumeros > 100000) {
            return res.status(400).json({ error: 'Quantidade de números deve estar entre 10 e 100.000' });
        }

        // Configurar URL da imagem se foi enviada
        let imagemUrl = null;
        if (req.file) {
            imagemUrl = `/uploads/rifas/${req.file.filename}`;
        }

        // Criar a rifa
        const rifa = await Rifa.create({
            titulo,
            descricao,
            premio,
            valorBilhete: parseFloat(valorBilhete),
            quantidadeBilhetes: parseInt(quantidadeNumeros),
            dataInicio: new Date(dataInicio),
            dataFim: new Date(dataFim),
            imagemUrl: imagemUrl
        });

        // Criar os bilhetes automaticamente
        const bilhetes = [];
        for (let i = 1; i <= quantidadeNumeros; i++) {
            bilhetes.push({
                numero: i,
                rifaId: rifa.id,
                valor: parseFloat(valorBilhete),
                status: 'disponivel'
            });
        }

        await Bilhete.bulkCreate(bilhetes);

        res.status(201).json(rifa);
    } catch (error) {
        console.error('❌ Erro ao criar rifa:', error.message);
        console.error('❌ Stack:', error.stack);

        // Verificar se é um erro de validação
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Erro de validação',
                details: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            error: 'Erro ao criar rifa',
            details: error.message
        });
    }
};

// Listar todas as rifas
exports.getRifas = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        // Filtro por status
        if (status !== 'all') {
            whereClause.status = status;
        }

        // Filtro por busca
        if (search) {
            whereClause[Op.or] = [
                { titulo: { [Op.iLike]: `%${search}%` } },
                { premio: { [Op.iLike]: `%${search}%` } },
                { descricao: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const rifas = await Rifa.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        // Calcular estatísticas para cada rifa
        const rifasComEstatisticas = await Promise.all(rifas.rows.map(async (rifa) => {
            const bilhetesVendidos = await Bilhete.count({
                where: { rifaId: rifa.id, status: 'vendido' }
            });
            const bilhetesDisponiveis = await Bilhete.count({
                where: { rifaId: rifa.id, status: 'disponivel' }
            });
            const totalBilhetes = rifa.quantidadeNumeros;
            const porcentagemVendida = totalBilhetes > 0 ? (bilhetesVendidos / totalBilhetes) * 100 : 0;

            return {
                ...rifa.toJSON(),
                estatisticas: {
                    bilhetesVendidos,
                    bilhetesDisponiveis,
                    totalBilhetes,
                    porcentagemVendida: Math.round(porcentagemVendida * 100) / 100
                }
            };
        }));

        res.status(200).json({
            rifas: rifasComEstatisticas,
            totalCount: rifas.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(rifas.count / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar rifas:', error);
        res.status(500).json({ error: 'Erro ao buscar rifas' });
    }
};

// Buscar rifa por ID
exports.getRifaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    include: [
                        {
                            model: Participante,
                            as: 'participante',
                            attributes: ['id', 'nome', 'celular']
                        }
                    ]
                },
                {
                    model: Sorteio,
                    as: 'sorteios'
                }
            ]
        });

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        res.status(200).json(rifa);
    } catch (error) {
        console.error('❌ Erro ao buscar rifa:', error);
        res.status(500).json({ error: 'Erro ao buscar rifa' });
    }
};

// Buscar participantes de uma rifa específica
exports.getParticipantesRifa = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        const bilhetes = await Bilhete.findAll({
            where: { rifaId: id },
            include: [
                {
                    model: Participante,
                    as: 'participante',
                    attributes: ['id', 'nome', 'celular', 'email']
                }
            ],
            order: [['numero', 'ASC']]
        });

        // Agrupar por participante
        const participantesMap = new Map();

        bilhetes.forEach(bilhete => {
            if (bilhete.participante) {
                const participanteId = bilhete.participante.id;
                if (!participantesMap.has(participanteId)) {
                    participantesMap.set(participanteId, {
                        id: bilhete.participante.id,
                        nome: bilhete.participante.nome,
                        celular: bilhete.participante.celular,
                        email: bilhete.participante.email,
                        numerosReservados: []
                    });
                }
                participantesMap.get(participanteId).numerosReservados.push(bilhete.numero);
            }
        });

        const participantes = Array.from(participantesMap.values());

        res.status(200).json(participantes);
    } catch (error) {
        console.error('❌ Erro ao buscar participantes da rifa:', error);
        res.status(500).json({ error: 'Erro ao buscar participantes da rifa' });
    }
};

// Atualizar rifa
exports.atualizarRifa = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        // Verificar se pode ser editada
        if (rifa.status === 'finalizada') {
            return res.status(400).json({ error: 'Não é possível editar uma rifa finalizada' });
        }

        // Verificar se tem bilhetes vendidos antes de alterar quantidade
        if (req.body.quantidadeNumeros && req.body.quantidadeNumeros !== rifa.quantidadeNumeros) {
            const bilhetesVendidos = await Bilhete.count({
                where: { rifaId: id, status: 'pago' }
            });

            if (bilhetesVendidos > 0) {
                return res.status(400).json({
                    error: 'Não é possível alterar quantidade de números com bilhetes já vendidos'
                });
            }
        }

        // Preparar dados para atualização
        const dadosAtualizacao = { ...req.body };

        // Configurar URL da imagem se foi enviada uma nova
        if (req.file) {
            dadosAtualizacao.imagemUrl = `/uploads/rifas/${req.file.filename}`;
        }

        await rifa.update(dadosAtualizacao);
        res.status(200).json(rifa);
    } catch (error) {
        console.error('❌ Erro ao atualizar rifa:', error);
        res.status(500).json({ error: 'Erro ao atualizar rifa' });
    }
};

// Excluir rifa
exports.excluirRifa = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        // Verificar se tem bilhetes vendidos
        const bilhetesVendidos = await Bilhete.count({
            where: { rifaId: id, status: 'pago' }
        });

        if (bilhetesVendidos > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir rifa com bilhetes vendidos'
            });
        }

        // Excluir bilhetes primeiro
        await Bilhete.destroy({ where: { rifaId: id } });

        // Excluir rifa
        await rifa.destroy();

        res.status(200).json({ message: 'Rifa excluída com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao excluir rifa:', error);
        res.status(500).json({ error: 'Erro ao excluir rifa' });
    }
};

// Pausar/Reativar rifa
exports.toggleStatusRifa = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        const novoStatus = rifa.status === 'ativa' ? 'pausada' : 'ativa';
        await rifa.update({ status: novoStatus });

        res.status(200).json({
            message: `Rifa ${novoStatus} com sucesso`,
            rifa
        });
    } catch (error) {
        console.error('❌ Erro ao alterar status da rifa:', error);
        res.status(500).json({ error: 'Erro ao alterar status da rifa' });
    }
};

// Obter estatísticas detalhadas da rifa
exports.getEstatisticasRifa = async (req, res) => {
    const { id } = req.params;
    try {
        const rifa = await Rifa.findByPk(id);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        const bilhetesDisponiveis = await Bilhete.count({
            where: { rifaId: id, status: 'disponivel' }
        });

        const bilhetesReservados = await Bilhete.count({
            where: { rifaId: id, status: 'reservado' }
        });

        const bilhetesVendidos = await Bilhete.count({
            where: { rifaId: id, status: 'pago' }
        });

        const totalArrecadado = bilhetesVendidos * rifa.valorBilhete;
        const percentualVendido = (bilhetesVendidos / rifa.quantidadeNumeros) * 100;

        const estatisticas = {
            totalNumeros: rifa.quantidadeNumeros,
            bilhetesDisponiveis,
            bilhetesReservados,
            bilhetesVendidos,
            totalArrecadado,
            percentualVendido: Math.round(percentualVendido * 100) / 100,
            valorPorcentagem: Math.round(((bilhetesVendidos / rifa.quantidadeNumeros) * 100) * 100) / 100
        };

        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
};
