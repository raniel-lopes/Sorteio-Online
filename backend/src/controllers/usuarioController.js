const { Op } = require('sequelize');
const { Usuario, Bilhete, Rifa, Sorteio, Pagamento } = require('../models');
const bcrypt = require('bcryptjs');

// Criar novo usuário
exports.createUsuario = async (req, res) => {
    try {
        const { nome, usuario, senha, perfil, email, celular, comissao, metaVendas } = req.body;

        if (!nome || !usuario || !senha || !perfil) {
            return res.status(400).json({ error: 'Nome, usuário, senha e perfil são obrigatórios' });
        }

        // Verificar se usuário já existe
        const usuarioExistente = await Usuario.findOne({ where: { usuario } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = await Usuario.create({
            nome,
            usuario,
            senha: senhaHash,
            perfil,
            email,
            celular,
            comissao: comissao || 0,
            metaVendas: metaVendas || 0
        });

        // Remover senha do retorno
        const { senha: _, ...usuarioSemSenha } = novoUsuario.toJSON();
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

// Listar usuários
exports.getUsuarios = async (req, res) => {
    try {
        const { page = 1, limit = 10, perfil = 'all', ativo = 'all' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        if (perfil !== 'all') {
            whereClause.perfil = perfil;
        }
        if (ativo !== 'all') {
            whereClause.ativo = ativo === 'true';
        }

        const usuarios = await Usuario.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['senha'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nome', 'ASC']]
        });

        res.status(200).json({
            usuarios: usuarios.rows,
            totalCount: usuarios.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(usuarios.count / limit)
        });
    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};

// Buscar usuário por ID
exports.getUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['senha'] }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};

// Atualizar usuário
exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, usuario, senha, perfil, email, celular, comissao, metaVendas, ativo } = req.body;

        const usuarioExistente = await Usuario.findByPk(id);
        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se está tentando alterar usuário para um já existente
        if (usuario && usuario !== usuarioExistente.usuario) {
            const usuarioConflito = await Usuario.findOne({
                where: { usuario, id: { [Op.ne]: id } }
            });
            if (usuarioConflito) {
                return res.status(400).json({ error: 'Nome de usuário já existe' });
            }
        }

        // Preparar dados para atualização
        const dadosAtualizacao = {
            nome: nome || usuarioExistente.nome,
            usuario: usuario || usuarioExistente.usuario,
            perfil: perfil || usuarioExistente.perfil,
            email: email || usuarioExistente.email,
            celular: celular || usuarioExistente.celular,
            comissao: comissao !== undefined ? comissao : usuarioExistente.comissao,
            metaVendas: metaVendas !== undefined ? metaVendas : usuarioExistente.metaVendas,
            ativo: ativo !== undefined ? ativo : usuarioExistente.ativo
        };

        if (senha) {
            dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
        }

        await usuarioExistente.update(dadosAtualizacao);

        // Remover senha do retorno
        const { senha: _, ...usuarioSemSenha } = usuarioExistente.toJSON();
        res.status(200).json(usuarioSemSenha);
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

// Excluir usuário
exports.excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se tem dependências que impedem a exclusão
        const bilhetesVendidos = await Bilhete.count({ where: { vendidoPor: id } });
        const rifasCriadas = await Rifa.count({ where: { criadoPor: id } });
        const sorteiosRealizados = await Sorteio.count({ where: { realizadoPor: id } });

        if (bilhetesVendidos > 0 || rifasCriadas > 0 || sorteiosRealizados > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir usuário com atividades registradas no sistema'
            });
        }

        await usuario.destroy();
        res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
};

// Ativar/Desativar usuário
exports.toggleUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        await usuario.update({ ativo: !usuario.ativo });

        res.status(200).json({
            message: `Usuário ${usuario.ativo ? 'ativado' : 'desativado'} com sucesso`,
            usuario: { ...usuario.toJSON(), senha: undefined }
        });
    } catch (error) {
        console.error('❌ Erro ao alterar status do usuário:', error);
        res.status(500).json({ error: 'Erro ao alterar status do usuário' });
    }
};

// Obter estatísticas do usuário
exports.getEstatisticasUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const bilhetesVendidos = await Bilhete.count({
            where: { vendidoPor: id, status: 'pago' }
        });

        const rifasCriadas = await Rifa.count({ where: { criadoPor: id } });
        const sorteiosRealizados = await Sorteio.count({ where: { realizadoPor: id } });

        // Calcular vendas do último mês
        const ultimoMes = new Date();
        ultimoMes.setMonth(ultimoMes.getMonth() - 1);

        const vendasUltimoMes = await Bilhete.count({
            where: {
                vendidoPor: id,
                status: 'pago',
                dataPagamento: { [Op.gte]: ultimoMes }
            }
        });

        // Calcular valor total das vendas
        const bilhetesComValor = await Bilhete.findAll({
            where: { vendidoPor: id, status: 'pago' },
            include: [
                {
                    model: Rifa,
                    as: 'rifa',
                    attributes: ['valorBilhete']
                }
            ]
        });

        const valorTotalVendas = bilhetesComValor.reduce((total, bilhete) => {
            return total + parseFloat(bilhete.valorPago || bilhete.rifa.valorBilhete);
        }, 0);

        const comissaoTotal = valorTotalVendas * (usuario.comissao / 100);

        const estatisticas = {
            bilhetesVendidos,
            rifasCriadas,
            sorteiosRealizados,
            vendasUltimoMes,
            valorTotalVendas,
            comissaoTotal,
            metaVendas: usuario.metaVendas,
            percentualMeta: usuario.metaVendas > 0 ? (bilhetesVendidos / usuario.metaVendas) * 100 : 0
        };

        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
};

// Atualizar dados pessoais do próprio usuário
exports.atualizarDados = async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        const { nome, email, celular } = req.body;

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        await usuario.update({
            nome: nome || usuario.nome,
            email: email || usuario.email,
            celular: celular || usuario.celular,
            ultimoAcesso: new Date()
        });

        const { senha: _, ...usuarioSemSenha } = usuario.toJSON();
        res.status(200).json(usuarioSemSenha);
    } catch (error) {
        console.error('❌ Erro ao atualizar dados pessoais:', error);
        res.status(500).json({ error: 'Erro ao atualizar dados pessoais' });
    }
};

// Atualizar senha do próprio usuário
exports.atualizarSenha = async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
        }

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar senha atual
        const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        // Atualizar com nova senha
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await usuario.update({ senha: novaSenhaHash });

        res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};

// Listar vendedores com ranking
exports.getRankingVendedores = async (req, res) => {
    try {
        const vendedores = await Usuario.findAll({
            where: { perfil: 'vendedor', ativo: true },
            attributes: { exclude: ['senha'] }
        });

        const vendedoresComEstatisticas = await Promise.all(
            vendedores.map(async (vendedor) => {
                const bilhetesVendidos = await Bilhete.count({
                    where: { vendidoPor: vendedor.id, status: 'pago' }
                });

                const bilhetesComValor = await Bilhete.findAll({
                    where: { vendidoPor: vendedor.id, status: 'pago' },
                    include: [
                        {
                            model: Rifa,
                            as: 'rifa',
                            attributes: ['valorBilhete']
                        }
                    ]
                });

                const valorTotalVendas = bilhetesComValor.reduce((total, bilhete) => {
                    return total + parseFloat(bilhete.valorPago || bilhete.rifa.valorBilhete);
                }, 0);

                const comissaoTotal = valorTotalVendas * (vendedor.comissao / 100);

                return {
                    ...vendedor.toJSON(),
                    bilhetesVendidos,
                    valorTotalVendas,
                    comissaoTotal,
                    percentualMeta: vendedor.metaVendas > 0 ? (bilhetesVendidos / vendedor.metaVendas) * 100 : 0
                };
            })
        );

        // Ordenar por bilhetes vendidos
        vendedoresComEstatisticas.sort((a, b) => b.bilhetesVendidos - a.bilhetesVendidos);

        res.status(200).json(vendedoresComEstatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter ranking de vendedores:', error);
        res.status(500).json({ error: 'Erro ao obter ranking de vendedores' });
    }
};