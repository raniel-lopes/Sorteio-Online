'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Pagamentos', 'participanteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Participantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Adicionar outras colunas que podem estar faltando
    try {
      await queryInterface.addColumn('Pagamentos', 'comprovanteUrl', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (error) {
      // Coluna já existe
    }

    try {
      await queryInterface.addColumn('Pagamentos', 'dadosPagamento', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    } catch (error) {
      // Coluna já existe
    }

    try {
      await queryInterface.addColumn('Pagamentos', 'dataAprovacao', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (error) {
      // Coluna já existe
    }

    try {
      await queryInterface.addColumn('Pagamentos', 'motivoRejeicao', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (error) {
      // Coluna já existe
    }

    // Atualizar enum de status se necessário
    try {
      await queryInterface.changeColumn('Pagamentos', 'status', {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado', 'confirmado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
      });
    } catch (error) {
      // Enum já atualizado
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pagamentos', 'participanteId');
    await queryInterface.removeColumn('Pagamentos', 'comprovanteUrl');
    await queryInterface.removeColumn('Pagamentos', 'dadosPagamento');
    await queryInterface.removeColumn('Pagamentos', 'dataAprovacao');
    await queryInterface.removeColumn('Pagamentos', 'motivoRejeicao');
  }
};
