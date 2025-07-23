'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sorteios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      rifaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rifas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bilheteVencedorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Bilhetes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      dataSorteio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      numeroSorteado: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('agendado', 'realizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'agendado'
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
    await queryInterface.dropTable('Sorteios');
  }
};
