'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Participantes', 'rifaId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Rifas',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Participantes', 'rifaId');
    }
};
