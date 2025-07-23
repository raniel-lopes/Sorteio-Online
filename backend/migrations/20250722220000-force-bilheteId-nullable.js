'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Forçar a alteração da coluna bilheteId para permitir NULL
        await queryInterface.sequelize.query(
            'ALTER TABLE "Pagamentos" ALTER COLUMN "bilheteId" DROP NOT NULL;'
        );
    },

    async down(queryInterface, Sequelize) {
        // Reverter para NOT NULL
        await queryInterface.sequelize.query(
            'ALTER TABLE "Pagamentos" ALTER COLUMN "bilheteId" SET NOT NULL;'
        );
    }
};
