'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tornar bilheteId opcional para suportar pagamentos de múltiplos bilhetes
    await queryInterface.changeColumn('Pagamentos', 'bilheteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Bilhetes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter para bilheteId obrigatório
    await queryInterface.changeColumn('Pagamentos', 'bilheteId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Bilhetes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
