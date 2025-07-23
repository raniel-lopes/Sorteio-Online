const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Carrega o .env da pasta backend

const { Sequelize } = require('sequelize');

// Configuração flexível de SSL
const isProduction = process.env.NODE_ENV === 'production';
const isSupabase = process.env.DB_HOST && process.env.DB_HOST.includes('supabase.co');

// Usar DATABASE_URL se disponível, senão usar configuração individual
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    })
    : new Sequelize({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: String(process.env.DB_PASSWORD),
        database: process.env.DB_NAME,
        dialect: 'postgres',
        dialectOptions: isSupabase ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        } : {},
        logging: false,
    });

module.exports = sequelize;
