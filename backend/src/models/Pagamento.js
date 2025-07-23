const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define('Pagamento', {
    participanteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'participantes',
            key: 'id'
        }
    },
    bilheteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'bilhetes',
            key: 'id'
        }
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    metodoPagamento: {
        type: DataTypes.ENUM('dinheiro', 'cartao', 'pix', 'transferencia'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado', 'confirmado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
    },
    comprovanteUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dadosPagamento: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    dataAprovacao: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    motivoRejeicao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    transacaoId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dataPagamento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Pagamentos',
});

module.exports = Pagamento;
