'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remover constraint unique do CPF se existir
        try {
            await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname LIKE '%cpf%' 
            AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
          ) THEN
            EXECUTE 'ALTER TABLE "Participantes" DROP CONSTRAINT ' || (
              SELECT conname FROM pg_constraint 
              WHERE conname LIKE '%cpf%' 
              AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
              LIMIT 1
            );
          END IF;
        END $$;
      `);
        } catch (error) {
            console.log('Constraint CPF não encontrada ou já removida');
        }

        // Remover constraint unique do celular se existir
        try {
            await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname LIKE '%celular%' 
            AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
          ) THEN
            EXECUTE 'ALTER TABLE "Participantes" DROP CONSTRAINT ' || (
              SELECT conname FROM pg_constraint 
              WHERE conname LIKE '%celular%' 
              AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
              LIMIT 1
            );
          END IF;
        END $$;
      `);
        } catch (error) {
            console.log('Constraint CELULAR não encontrada ou já removida');
        }

        // Remover constraint unique do email se existir
        try {
            await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname LIKE '%email%' 
            AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
          ) THEN
            EXECUTE 'ALTER TABLE "Participantes" DROP CONSTRAINT ' || (
              SELECT conname FROM pg_constraint 
              WHERE conname LIKE '%email%' 
              AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
              LIMIT 1
            );
          END IF;
        END $$;
      `);
        } catch (error) {
            console.log('Constraint EMAIL não encontrada ou já removida');
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Não recria unique em celular/email/cpf
    }
};
