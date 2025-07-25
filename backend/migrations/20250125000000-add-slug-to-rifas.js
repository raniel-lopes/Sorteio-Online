'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Rifas', 'slug', {
      type: Sequelize.STRING,
      allowNull: true, // Temporariamente nullable para rifas existentes
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rifas', 'slug');
  }
};
