'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rifas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      premio: {
        type: Sequelize.STRING,
        allowNull: false
      },
      valorBilhete: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantidadeBilhetes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bilhetesVendidos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      dataInicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      dataFim: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ativa', 'encerrada', 'cancelada'),
        allowNull: false,
        defaultValue: 'ativa'
      },
      imagemUrl: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Rifas');
  }
};
