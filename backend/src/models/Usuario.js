const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    perfil: {
        type: DataTypes.ENUM('admin', 'vendedor', 'visualizador'), // Perfis específicos para rifas
        allowNull: false,
        defaultValue: 'visualizador',
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    comissao: {
        type: DataTypes.DECIMAL(5, 2), // Percentual de comissão para vendedores
        defaultValue: 0.00,
    },
    metaVendas: {
        type: DataTypes.INTEGER, // Meta de bilhetes vendidos
        allowNull: true,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    ultimoAcesso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalVendas: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    totalBilhetesVendidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true, // Ativando timestamps para auditoria
    tableName: 'Usuarios',
});

module.exports = Usuario;