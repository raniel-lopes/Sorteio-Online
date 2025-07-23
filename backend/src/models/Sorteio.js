const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sorteio = sequelize.define('Sorteio', {
    rifaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rifas',
            key: 'id'
        }
    },
    numeroSorteado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bilheteVencedorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'bilhetes',
            key: 'id'
        }
    },
    dataSorteio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    numeroSorteado: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('agendado', 'realizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'agendado'
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Sorteios',
});

module.exports = Sorteio;
