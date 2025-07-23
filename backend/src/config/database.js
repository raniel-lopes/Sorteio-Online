const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Carrega o .env da pasta backend

const { Sequelize } = require('sequelize');

// Configuração flexível de SSL
const isProduction = process.env.NODE_ENV === 'production';
const isAWS = process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD), // Força conversão para string
    database: process.env.DB_NAME,
    dialect: 'postgres',
    dialectOptions: isAWS ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : {},
    logging: false, // Desabilita logs SQL
});

module.exports = sequelize;
