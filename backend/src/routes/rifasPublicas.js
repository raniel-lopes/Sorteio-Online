const express = require('express');
const router = express.Router();
const { Rifa, Bilhete, Participante } = require('../models');

// Rota pública para buscar uma rifa por slug (temporariamente desabilitada)
router.get('/publica/slug/:slug', async (req, res) => {
    return res.status(501).json({ error: 'Busca por slug ainda não implementada. Use o ID da rifa.' });
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

// Rota para verificar números de um participante pelo celular - OTIMIZADA
router.post('/publica/:id/verificar-numeros', async (req, res) => {
    try {
        const { celular } = req.body;
        const rifaId = req.params.id;

        if (!celular) {
            return res.status(400).json({ error: 'Celular é obrigatório' });
        }

        // Busca otimizada usando JOIN direto no SQL
        const [bilhetes] = await require('../config/database').query(`
            SELECT 
                b.id,
                b.numero,
                b.status,
                b."dataVenda",
                p.id as participante_id,
                p.nome as participante_nome,
                p.celular as participante_celular,
                p.email as participante_email
            FROM "Bilhetes" b
            INNER JOIN "Participantes" p ON b."participanteId" = p.id
            WHERE b."rifaId" = :rifaId 
            AND p.celular = :celular
            ORDER BY b.numero ASC
        `, {
            replacements: { rifaId, celular },
            type: require('sequelize').QueryTypes.SELECT
        });

        if (!bilhetes || bilhetes.length === 0) {
            return res.status(404).json({
                message: 'Nenhum número encontrado para este celular nesta rifa'
            });
        }

        // Formatar resposta
        const resultado = {
            participante: {
                id: bilhetes[0].participante_id,
                nome: bilhetes[0].participante_nome,
                celular: bilhetes[0].participante_celular,
                email: bilhetes[0].participante_email
            },
            bilhetes: bilhetes.map(b => ({
                id: b.id,
                numero: b.numero,
                status: b.status,
                dataVenda: b.dataVenda
            })),
            total: bilhetes.length
        };

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao verificar números:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
