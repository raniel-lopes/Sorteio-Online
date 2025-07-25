#!/bin/bash
echo "🚀 Executando migrações no Railway..."
cd /app/backend
npx sequelize-cli db:migrate
echo "✅ Migrações concluídas!"

echo "🔧 Gerando slugs para rifas existentes..."
node gerar-slugs-existentes.js
echo "✅ Slugs gerados!"
