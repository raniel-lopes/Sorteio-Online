const express = require('express');
const router = express.Router();
const { Rifa, Bilhete, Participante } = require('../models');

// Rota pública para buscar uma rifa por slug
router.get('/publica/slug/:slug', async (req, res) => {
    try {
        console.log('🔍 Buscando rifa por slug:', req.params.slug);

        // Buscar rifa por slug
        const rifa = await Rifa.findOne({
            where: { slug: req.params.slug },
            attributes: ['id', 'titulo', 'descricao', 'valorBilhete', 'quantidadeBilhetes', 'dataInicio', 'dataFim', 'status', 'imagemUrl', 'chavePix', 'slug']
        });

        if (!rifa) {
            console.log('❌ Rifa não encontrada para slug:', req.params.slug);
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        console.log('✅ Rifa encontrada:', rifa.titulo);

        // Calcular estatísticas usando agregação (muito mais rápido)
        const [stats] = await require('../config/database').query(`
            SELECT 
                COUNT(CASE WHEN status = 'vendido' THEN 1 END) as vendidos,
                COUNT(CASE WHEN status = 'reservado' THEN 1 END) as reservados
            FROM "Bilhetes" 
            WHERE "rifaId" = :rifaId
        `, {
            replacements: { rifaId: rifa.id },
            type: require('sequelize').QueryTypes.SELECT
        });

        const bilhetesVendidos = parseInt(stats.vendidos) || 0;
        const bilhetesReservados = parseInt(stats.reservados) || 0;

        const rifaComStats = {
            ...rifa.toJSON(),
            bilhetesVendidos,
            bilhetesReservados,
            bilhetesDisponiveis: rifa.quantidadeBilhetes - bilhetesVendidos - bilhetesReservados
        };

        console.log('📊 Estatísticas calculadas para slug:', req.params.slug);
        res.json(rifaComStats);

    } catch (error) {
        console.error('❌ Erro ao buscar rifa por slug:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota pública para buscar uma rifa específica por ID (manter para compatibilidade)
router.get('/publica/:id', async (req, res) => {
    try {
        // Buscar rifa sem carregar todos os bilhetes
        const rifa = await Rifa.findByPk(req.params.id, {
            attributes: ['id', 'titulo', 'descricao', 'valorBilhete', 'quantidadeBilhetes', 'dataInicio', 'dataFim', 'status', 'imagemUrl', 'chavePix']
        });

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        // Calcular estatísticas usando agregação (muito mais rápido)
        const [stats] = await require('../config/database').query(`
            SELECT 
                COUNT(CASE WHEN status = 'vendido' THEN 1 END) as vendidos,
                COUNT(CASE WHEN status = 'reservado' THEN 1 END) as reservados
            FROM "Bilhetes" 
            WHERE "rifaId" = :rifaId
        `, {
            replacements: { rifaId: req.params.id },
            type: require('sequelize').QueryTypes.SELECT
        });

        const bilhetesVendidos = parseInt(stats.vendidos) || 0;
        const bilhetesReservados = parseInt(stats.reservados) || 0;

        const rifaPublica = {
            id: rifa.id,
            titulo: rifa.titulo,
            descricao: rifa.descricao,
            valorBilhete: rifa.valorBilhete,
            quantidadeBilhetes: rifa.quantidadeBilhetes,
            dataInicio: rifa.dataInicio,
            dataFim: rifa.dataFim,
            status: rifa.status,
            imagemUrl: rifa.imagemUrl,
            chavePix: rifa.chavePix,
            bilhetesVendidos,
            bilhetesReservados,
            bilhetesDisponiveis: rifa.quantidadeBilhetes - bilhetesVendidos - bilhetesReservados
        };

        res.json(rifaPublica);
    } catch (error) {
        console.error('Erro ao buscar rifa pública:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para reservar bilhetes (sem autenticação) - OTIMIZADA
router.post('/publica/:id/reservar', async (req, res) => {
    const transaction = await require('../config/database').transaction();

    try {
        const { participanteId, quantidade } = req.body;
        const rifaId = req.params.id;

        // Validação básica
        if (!participanteId || !quantidade || quantidade <= 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        // Verificar se a rifa existe e está ativa (sem includes desnecessários)
        const rifa = await Rifa.findByPk(rifaId, {
            attributes: ['id', 'quantidadeBilhetes', 'status'],
            transaction
        });

        if (!rifa || rifa.status !== 'ativa') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Rifa não encontrada ou inativa' });
        }

        // Verificar disponibilidade usando agregação otimizada
        const [result] = await require('../config/database').query(`
            SELECT COUNT(*) as ocupados 
            FROM "Bilhetes" 
            WHERE "rifaId" = :rifaId 
            AND "status" IN ('vendido', 'reservado')
        `, {
            replacements: { rifaId },
            type: require('sequelize').QueryTypes.SELECT,
            transaction
        });

        const bilhetesOcupados = parseInt(result.ocupados);
        const bilhetesDisponiveis = rifa.quantidadeBilhetes - bilhetesOcupados;

        if (quantidade > bilhetesDisponiveis) {
            await transaction.rollback();
            return res.status(400).json({
                error: `Apenas ${bilhetesDisponiveis} bilhetes disponíveis`
            });
        }

        // Gerar números de forma otimizada (em lote)
        const proximoNumero = bilhetesOcupados + 1;
        const bilhetes = [];

        for (let i = 0; i < quantidade; i++) {
            bilhetes.push({
                rifaId: rifaId,
                participanteId: participanteId,
                numero: proximoNumero + i,
                status: 'reservado',
                valor: 0 // Será definido depois
            });
        }

        // Criar todos os bilhetes de uma vez (operação atômica)
        const bilhetesCriados = await Bilhete.bulkCreate(bilhetes, {
            transaction,
            validate: true,
            returning: true
        });

        await transaction.commit();

        res.json({
            success: true,
            message: `${quantidade} bilhetes reservados com sucesso`,
            bilhetes: bilhetesCriados.map(b => ({
                id: b.id,
                numero: b.numero,
                status: b.status
            }))
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao reservar bilhetes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para verificar números de um participante pelo celular - VERSÃO ESTÁVEL
router.post('/publica/:id/verificar-numeros', async (req, res) => {
    try {
        const { celular } = req.body;
        const rifaId = req.params.id;

        if (!celular) {
            return res.status(400).json({ error: 'Celular é obrigatório' });
        }

        // 1. Normalizar o celular removendo caracteres especiais
        const celularLimpo = String(celular).replace(/\D/g, '');

        // 2. Buscar todos os participantes da rifa e comparar manualmente
        const participantes = await Participante.findAll({
            where: { rifaId: rifaId },
            attributes: ['id', 'nome', 'celular', 'email']
        });

        // 3. Encontrar participante por comparação manual
        let participanteEncontrado = null;
        for (const p of participantes) {
            const celularParticipante = String(p.celular || '').replace(/\D/g, '');
            if (celularParticipante === celularLimpo) {
                participanteEncontrado = p;
                break;
            }
        }

        if (!participanteEncontrado) {
            return res.status(404).json({ message: 'Participante não encontrado para este celular' });
        }

        // 4. Buscar bilhetes do participante nesta rifa
        const bilhetes = await Bilhete.findAll({
            where: {
                participanteId: participanteEncontrado.id,
                rifaId: rifaId
            },
            attributes: ['numero', 'status'],
            order: [['numero', 'ASC']]
        });

        if (!bilhetes.length) {
            return res.status(404).json({ message: 'Nenhum número encontrado para este celular nesta rifa' });
        }

        // 5. Calcular valor total
        const rifa = await Rifa.findByPk(rifaId, { attributes: ['valorBilhete'] });
        const valorTotal = rifa ? (bilhetes.length * parseFloat(rifa.valorBilhete)).toFixed(2) : '0.00';

        // 6. Determinar status geral
        const statusGeral = bilhetes.some(b => b.status === 'vendido') ? 'vendido' : 'reservado';

        res.json({
            participante: {
                nome: participanteEncontrado.nome,
                celular: participanteEncontrado.celular,
                email: participanteEncontrado.email
            },
            numeros: bilhetes.map(b => ({ numero: b.numero, status: b.status })),
            totalNumeros: bilhetes.length,
            valorTotal: valorTotal,
            statusGeral: statusGeral
        });

    } catch (error) {
        console.error('Erro ao verificar números:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
