'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove índice unique do email
        await queryInterface.removeIndex('Participantes', ['email']);
    },
    async down(queryInterface, Sequelize) {
        // Recria índice unique do email
        await queryInterface.addIndex('Participantes', ['email'], {
            unique: true,
            name: 'participantes_email_unique'
        });
    }
};
