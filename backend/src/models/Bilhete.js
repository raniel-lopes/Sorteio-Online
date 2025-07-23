const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bilhete = sequelize.define('Bilhete', {
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rifaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rifas',
            key: 'id'
        }
    },
    participanteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'participantes',
            key: 'id'
        }
    },
    vendedorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('disponivel', 'vendido', 'reservado'),
        allowNull: false,
        defaultValue: 'disponivel'
    },
    dataVenda: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Bilhetes',
});

module.exports = Bilhete;
