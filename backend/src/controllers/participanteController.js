const { Op } = require('sequelize');
const { Participante, Bilhete, Pagamento } = require('../models');

// Função auxiliar para formatar o número de celular
function formatarCelular(numero) {
    const digits = numero.replace(/\D/g, ''); // Remove tudo que não for número
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return numero; // Retorna como está se não tiver 11 dígitos
}

// Função auxiliar para formatar CPF
function formatarCPF(cpf) {
    if (!cpf) return null;
    const digits = cpf.replace(/\D/g, ''); // Remove tudo que não for número
    if (digits.length === 11) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    return cpf; // Retorna como está se não tiver 11 dígitos
}

// Criar um novo participante
exports.createParticipante = async (req, res) => {
    try {
        const { nomeCompleto, celular, cpf } = req.body;

        if (!nomeCompleto || !celular) {
            return res.status(400).json({ error: 'Nome e celular são obrigatórios' });
        }

        // Verifica se CPF já existe
        if (cpf) {
            const cpfExistente = await Participante.findOne({ where: { cpf } });
            if (cpfExistente) {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }
        }

        // Formata os dados
        const celularFormatado = formatarCelular(celular);
        const cpfFormatado = formatarCPF(cpf);

        // Cria o participante com os dados formatados
        const participante = await Participante.create({
            ...req.body,
            celular: celularFormatado,
            cpf: cpfFormatado,
        });

        res.status(201).json(participante);
    } catch (error) {
        console.error('❌ Erro ao criar participante:', error);
        res.status(500).json({ error: 'Erro ao criar participante' });
    }
};

// Listar todos os participantes
exports.getParticipantes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = search ? {
            [Op.or]: [
                { nomeCompleto: { [Op.iLike]: `%${search}%` } },
                { celular: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { cpf: { [Op.iLike]: `%${search}%` } }
            ]
        } : {};

        const participantes = await Participante.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    attributes: ['id', 'numero', 'status']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            participantes: participantes.rows,
            totalCount: participantes.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(participantes.count / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar participantes:', error);
        res.status(500).json({ error: 'Erro ao buscar participantes' });
    }
};

// Buscar participante por ID
exports.getParticipantePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const participante = await Participante.findByPk(id, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    include: [
                        {
                            model: Pagamento,
                            as: 'pagamento'
                        }
                    ]
                }
            ]
        });

        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }

        res.status(200).json(participante);
    } catch (error) {
        console.error('❌ Erro ao buscar participante:', error);
        res.status(500).json({ error: 'Erro ao buscar participante' });
    }
};

// Atualizar participante
exports.atualizarParticipante = async (req, res) => {
    const { id } = req.params;
    try {
        const participante = await Participante.findByPk(id);
        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }

        // Verifica se está tentando alterar CPF para um já existente
        if (req.body.cpf && req.body.cpf !== participante.cpf) {
            const cpfExistente = await Participante.findOne({
                where: { cpf: req.body.cpf, id: { [Op.ne]: id } }
            });
            if (cpfExistente) {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }
        }

        // Formata os dados se necessário
        if (req.body.celular) {
            req.body.celular = formatarCelular(req.body.celular);
        }
        if (req.body.cpf) {
            req.body.cpf = formatarCPF(req.body.cpf);
        }

        await participante.update(req.body);
        res.status(200).json(participante);
    } catch (error) {
        console.error('❌ Erro ao atualizar participante:', error);
        res.status(500).json({ error: 'Erro ao atualizar participante' });
    }
};

// Excluir participante
exports.excluirParticipante = async (req, res) => {
    const { id } = req.params;
    try {
        const participante = await Participante.findByPk(id);
        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }

        // Verifica se tem bilhetes associados
        const bilhetes = await Bilhete.findAll({ where: { participanteId: id } });
        if (bilhetes.length > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir participante que possui bilhetes'
            });
        }

        await participante.destroy();
        res.status(200).json({ message: 'Participante excluído com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao excluir participante:', error);
        res.status(500).json({ error: 'Erro ao excluir participante' });
    }
};

// Obter estatísticas do participante
exports.getEstatisticasParticipante = async (req, res) => {
    const { id } = req.params;
    try {
        const participante = await Participante.findByPk(id, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    include: [
                        {
                            model: Pagamento,
                            as: 'pagamento'
                        }
                    ]
                }
            ]
        });

        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }

        const estatisticas = {
            totalBilhetes: participante.bilhetes.length,
            bilhetesVendidos: participante.bilhetes.filter(b => b.status === 'vendido').length,
            totalGasto: participante.totalGasto,
            rifasParticipadas: [...new Set(participante.bilhetes.map(b => b.rifaId))].length,
            ultimaParticipacao: participante.bilhetes.length > 0 ?
                Math.max(...participante.bilhetes.map(b => new Date(b.dataCompra))) : null
        };

        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
};