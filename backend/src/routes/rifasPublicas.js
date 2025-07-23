const express = require('express');
const router = express.Router();
const { Rifa, Bilhete, Participante } = require('../models');

// Rota pública para buscar uma rifa específica
router.get('/publica/:id', async (req, res) => {
    try {
        const rifa = await Rifa.findByPk(req.params.id, {
            include: [
                {
                    model: Bilhete,
                    as: 'bilhetes',
                    include: [
                        {
                            model: Participante,
                            as: 'participante',
                            attributes: ['nome']
                        }
                    ]
                }
            ]
        });

        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        // Calcular estatísticas
        const bilhetesVendidos = rifa.bilhetes.filter(b => b.status === 'vendido').length;
        const bilhetesReservados = rifa.bilhetes.filter(b => b.status === 'reservado').length;

        const rifaPublica = {
            id: rifa.id,
            titulo: rifa.titulo,
            descricao: rifa.descricao,
            valorBilhete: rifa.valorBilhete,
            quantidadeBilhetes: rifa.quantidadeBilhetes,
            dataSorteio: rifa.dataSorteio,
            status: rifa.status,
            imagemUrl: rifa.imagemUrl,
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

// Rota para reservar bilhetes (sem autenticação)
router.post('/publica/:id/reservar', async (req, res) => {
    try {
        const { participanteId, quantidade } = req.body;
        const rifaId = req.params.id;

        // Verificar se a rifa existe e está ativa
        const rifa = await Rifa.findByPk(rifaId);
        if (!rifa) {
            return res.status(404).json({ error: 'Rifa não encontrada' });
        }

        if (rifa.status !== 'ativa') {
            return res.status(400).json({ error: 'Rifa não está ativa' });
        }

        // Verificar disponibilidade
        const bilhetesExistentes = await Bilhete.count({
            where: {
                rifaId: rifaId,
                status: ['vendido', 'reservado']
            }
        });

        if (bilhetesExistentes + quantidade > rifa.quantidadeBilhetes) {
            return res.status(400).json({ error: 'Não há bilhetes suficientes disponíveis' });
        }

        // Criar bilhetes reservados
        const bilhetes = [];
        for (let i = 0; i < quantidade; i++) {
            const proximoNumero = bilhetesExistentes + i + 1;
            bilhetes.push({
                rifaId: rifaId,
                participanteId: participanteId,
                numero: proximoNumero,
                status: 'reservado'
            });
        }

        const bilhetesCriados = await Bilhete.bulkCreate(bilhetes);

        res.json({
            success: true,
            message: 'Bilhetes reservados com sucesso',
            bilhetes: bilhetesCriados
        });
    } catch (error) {
        console.error('Erro ao reservar bilhetes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para verificar números de um participante pelo celular
router.post('/publica/:id/verificar-numeros', async (req, res) => {
    try {
        const { celular } = req.body;
        const rifaId = req.params.id;

        if (!celular) {
            return res.status(400).json({ error: 'Celular é obrigatório' });
        }

        // Buscar bilhetes do participante nesta rifa específica
        const bilhetes = await Bilhete.findAll({
            where: {
                rifaId: rifaId
            },
            include: [
                {
                    model: Participante,
                    as: 'participante',
                    where: {
                        celular: celular
                    },
                    attributes: ['id', 'nome', 'celular', 'email']
                }
            ],
            order: [['numero', 'ASC']]
        });

        if (!bilhetes || bilhetes.length === 0) {
            return res.status(404).json({
                message: 'Nenhum número encontrado para este celular nesta rifa'
            });
        }

        // Pegar dados do participante (todos os bilhetes têm o mesmo participante)
        const participante = bilhetes[0].participante;

        // Calcular valor total gasto
        const valorTotal = bilhetes.reduce((total, bilhete) => total + parseFloat(bilhete.valor), 0);

        const resultado = {
            participante: {
                nome: participante.nome,
                celular: participante.celular,
                email: participante.email
            },
            numeros: bilhetes.map(bilhete => ({
                numero: bilhete.numero,
                status: bilhete.status,
                valor: bilhete.valor
            })),
            totalNumeros: bilhetes.length,
            valorTotal: valorTotal.toFixed(2),
            statusGeral: bilhetes.length > 0 ? bilhetes[0].status : 'não encontrado'
        };

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao verificar números:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
