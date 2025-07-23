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

        // Adicionar constraint unique no celular se não existir
        try {
            await queryInterface.sequelize.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname LIKE '%celular%' 
            AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'Participantes')
          ) THEN
            ALTER TABLE "Participantes" ADD CONSTRAINT "Participantes_celular_unique" UNIQUE ("celular");
          END IF;
        END $$;
      `);
        } catch (error) {
            console.log('Erro ao adicionar constraint unique no celular:', error.message);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Reverter: remover unique do celular e adicionar no CPF
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE "Participantes" DROP CONSTRAINT IF EXISTS "Participantes_celular_unique";
      `);

            await queryInterface.sequelize.query(`
        ALTER TABLE "Participantes" ADD CONSTRAINT "Participantes_cpf_unique" UNIQUE ("cpf");
      `);
        } catch (error) {
            console.log('Erro ao reverter constraints:', error.message);
        }
    }
};
