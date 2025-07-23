'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remover o enum antigo e criar um novo com os valores corretos
        await queryInterface.sequelize.query(`
      -- Primeiro, alterar todos os registros que possam ter status não válidos
      UPDATE "Pagamentos" SET status = 'pendente' WHERE status NOT IN ('pendente', 'confirmado', 'cancelado');
      
      -- Dropar o enum antigo
      DROP TYPE IF EXISTS "enum_Pagamentos_status_new";
      
      -- Criar novo enum com todos os valores necessários
      CREATE TYPE "enum_Pagamentos_status_new" AS ENUM ('pendente', 'aprovado', 'rejeitado', 'confirmado', 'cancelado');
      
      -- Alterar a coluna para usar o novo enum
      ALTER TABLE "Pagamentos" 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE "enum_Pagamentos_status_new" USING status::text::"enum_Pagamentos_status_new",
      ALTER COLUMN status SET DEFAULT 'pendente';
      
      -- Dropar o enum antigo
      DROP TYPE IF EXISTS "enum_Pagamentos_status";
      
      -- Renomear o novo enum
      ALTER TYPE "enum_Pagamentos_status_new" RENAME TO "enum_Pagamentos_status";
    `);
    },

    down: async (queryInterface, Sequelize) => {
        // Reverter para o enum original
        await queryInterface.sequelize.query(`
      -- Atualizar registros que não existem no enum antigo
      UPDATE "Pagamentos" SET status = 'pendente' WHERE status NOT IN ('pendente', 'confirmado', 'cancelado');
      
      -- Criar enum antigo
      CREATE TYPE "enum_Pagamentos_status_new" AS ENUM ('pendente', 'confirmado', 'cancelado');
      
      -- Alterar a coluna para usar o enum antigo
      ALTER TABLE "Pagamentos" 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE "enum_Pagamentos_status_new" USING status::text::"enum_Pagamentos_status_new",
      ALTER COLUMN status SET DEFAULT 'pendente';
      
      -- Dropar o enum atual
      DROP TYPE IF EXISTS "enum_Pagamentos_status";
      
      -- Renomear para o nome correto
      ALTER TYPE "enum_Pagamentos_status_new" RENAME TO "enum_Pagamentos_status";
    `);
    }
};
