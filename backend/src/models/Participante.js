const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participante = sequelize.define('Participante', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Celular como identificador único
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: true,
        // Removido unique: true para permitir múltiplas compras do mesmo CPF
    },
    endereco: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true, // Adiciona createdAt e updatedAt
    tableName: 'Participantes', // Nome da tabela no banco de dados
});

module.exports = Participante;