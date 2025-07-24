// backend/src/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');

// Criar diretórios de upload se não existirem
const createUploadDirs = () => {
    const uploadDirs = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../uploads/rifas'),
        path.join(__dirname, '../uploads/comprovantes')
    ];
    
    uploadDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Diretório criado: ${dir}`);
        }
    });
};

// Criar diretórios na inicialização
createUploadDirs();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const participantesRoutes = require('./routes/participantes');
const participantesPublicosRoutes = require('./routes/participantesPublicos');
const rifasRoutes = require('./routes/rifas');
const rifasPublicasRoutes = require('./routes/rifasPublicas');
const bilhetesRoutes = require('./routes/bilhetes');
const pagamentosRoutes = require('./routes/pagamentos');
const pagamentosValidacaoRoutes = require('./routes/pagamentosValidacao');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Libera o frontend (React) para se comunicar com o backend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://sorteio-online.vercel.app',
        'https://*.vercel.app',
        'https://sorteio-online-production.vercel.app'
    ],
    credentials: true
}));

// Middleware para ler JSON do corpo da requisição
app.use(express.json());

// Middleware para servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas principais do sistema
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/publico', participantesPublicosRoutes); // Rotas públicas primeiro
app.use('/api/publico', rifasPublicasRoutes); // Rotas públicas primeiro
app.use('/api/participantes', participantesRoutes);
app.use('/api/rifas', rifasRoutes);
app.use('/api/bilhetes', bilhetesRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/validacao-pagamentos', pagamentosValidacaoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota teste
app.get('/', (req, res) => {
    res.send('🎯 Sistema de Rifas Online - Servidor está funcionando!');
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Testa a conexão com o banco de dados
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com o banco de dados bem-sucedida!');
        console.log('✅ Usando migrações para gerenciar tabelas!');
    })
    .catch((error) => {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    });

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Sistema de Rifas Online rodando na porta ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
});

module.exports = app;
