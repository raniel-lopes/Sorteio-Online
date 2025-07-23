// Teste simples do servidor
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');

const app = express();

// Libera o frontend (React) para se comunicar com o backend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware para ler JSON do corpo da requisição
app.use(express.json());

// Rota teste
app.get('/', (req, res) => {
    res.send('🎯 Sistema de Rifas Online - Servidor está funcionando!');
});

// Testa a conexão com o banco de dados
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com o banco de dados bem-sucedida!');
    })
    .catch((error) => {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    });

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
});

module.exports = app;
