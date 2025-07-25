const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rifa = sequelize.define('Rifa', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // slug: {
    //     type: DataTypes.STRING,
    //     allowNull: true, // Permitir null temporariamente para rifas existentes
    //     unique: true,
    // },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    premio: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valorBilhete: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantidadeBilhetes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dataInicio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dataFim: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ativa', 'encerrada', 'cancelada'),
        defaultValue: 'ativa',
    },
    bilhetesVendidos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    imagemUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chavePix: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'Rifas',
});

module.exports = Rifa;
