'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pagamentos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bilheteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bilhetes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      metodoPagamento: {
        type: Sequelize.ENUM('dinheiro', 'cartao', 'pix', 'transferencia'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pendente', 'confirmado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
      },
      transacaoId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dataPagamento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pagamentos');
  }
};
