# 🎯 Sistema de Rifas Online

Sistema completo para gerenciamento de rifas online com PIX.

## ✨ Funcionalidades

### 🎟️ **Gestão de Rifas**
- ✅ Criar, editar e gerenciar rifas
- ✅ Upload de imagens promocionais
- ✅ Controle de status (ativa, encerrada, cancelada)
- ✅ Chave PIX personalizada por rifa
- ✅ Proteção de dados (não altera quantidade com bilhetes vendidos)

### 👥 **Participantes**
- ✅ Cadastro público de participantes
- ✅ Reserva de números
- ✅ Validação de dados

### 💰 **Pagamentos**
- ✅ Integração com PIX
- ✅ Upload de comprovantes
- ✅ Validação manual de pagamentos
- ✅ Controle de status

### 📊 **Dashboard Administrativo**
- ✅ Métricas em tempo real
- ✅ Relatórios de vendas
- ✅ Gestão de usuários
- ✅ Controle completo

## 🚀 Deploy

### **Pré-requisitos**
- Node.js 16+
- PostgreSQL (Supabase recomendado)

### **Configuração Backend**

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente (.env):**
```env
# Banco de dados (Supabase)
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_key_do_supabase
DATABASE_URL=postgresql://postgres:[senha]@db.[referencia].supabase.co:5432/postgres

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Servidor
PORT=5000
NODE_ENV=production
```

3. **Executar migrações:**
```bash
npm run migrate
```

4. **Iniciar servidor:**
```bash
npm start
```

### **Configuração Frontend**

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente (.env.production):**
```env
VITE_API_URL=https://sua-api-url.com/api
```

3. **Build para produção:**
```bash
npm run build
```

4. **Deploy (Vercel/Netlify):**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist
```

## 👤 **Acesso Inicial**

**Usuário Admin:**
- Email: `admin@admin.com`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 🛠️ **Tecnologias**

### **Backend:**
- Node.js + Express
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- Multer (uploads)

### **Frontend:**
- React 18
- Tailwind CSS
- Axios
- React Router
- React Icons

## 📁 **Estrutura do Projeto**

```
sorteio-online/
├── backend/
│   ├── src/
│   │   ├── config/        # Configurações
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── middleware/    # Middlewares
│   │   ├── models/        # Modelos do banco
│   │   ├── routes/        # Rotas da API
│   │   └── services/      # Serviços
│   ├── uploads/           # Arquivos carregados
│   └── migrations/        # Migrações do banco
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   └── services/      # Serviços API
│   └── public/            # Arquivos estáticos
└── README.md
```

## 🔒 **Segurança**

- ✅ Autenticação JWT
- ✅ Middleware de autorização
- ✅ Validação de dados
- ✅ Proteção contra alterações indevidas
- ✅ CORS configurado

## 📞 **Suporte**

Sistema desenvolvido para gerenciamento profissional de rifas online.

---

**🎯 Sistema de Rifas Online - Versão 1.0**
