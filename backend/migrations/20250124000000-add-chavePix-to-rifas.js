'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Rifas', 'chavePix', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: ''
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Rifas', 'chavePix');
    }
};
