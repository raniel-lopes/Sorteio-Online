# Rotas do Sistema de Rifas Online

## 📋 Resumo das Rotas Atualizadas

### 🔐 **Autenticação**
- **Base URL**: `/api/auth`
- **Arquivo**: `authRoutes.js`
- **Rotas**:
  - `POST /login` - Login do usuário
  - `POST /register` - Registro de novo usuário
  - `POST /logout` - Logout do usuário

### 👥 **Usuários**
- **Base URL**: `/api/usuarios`
- **Arquivo**: `usuariosRoutes.js`
- **Rotas**:
  - `GET /` - Listar usuários
  - `GET /:id` - Buscar usuário por ID
  - `POST /` - Criar usuário (admin only)
  - `PUT /:id` - Atualizar usuário (admin only)
  - `DELETE /:id` - Excluir usuário (admin only)
  - `PATCH /:id/toggle` - Ativar/Desativar usuário (admin only)
  - `PUT /me` - Atualizar dados pessoais
  - `PUT /me/senha` - Atualizar senha
  - `GET /:id/estatisticas` - Estatísticas do usuário
  - `GET /ranking/vendedores` - Ranking de vendedores

### 🎯 **Participantes**
- **Base URL**: `/api/participantes`
- **Arquivo**: `participantes.js`
- **Rotas**:
  - `GET /` - Listar participantes
  - `POST /` - Criar participante
  - `GET /:id` - Buscar participante por ID
  - `PUT /:id` - Atualizar participante
  - `DELETE /:id` - Excluir participante
  - `GET /:id/estatisticas` - Estatísticas do participante

### 🎪 **Rifas**
- **Base URL**: `/api/rifas`
- **Arquivo**: `rifas.js`
- **Rotas**:
  - `GET /` - Listar rifas (todos)
  - `GET /:id` - Buscar rifa por ID (todos)
  - `GET /:id/estatisticas` - Estatísticas da rifa (todos)
  - `POST /` - Criar rifa (admin/vendedor)
  - `PUT /:id` - Atualizar rifa (admin/vendedor)
  - `DELETE /:id` - Excluir rifa (admin/vendedor)
  - `PATCH /:id/toggle-status` - Pausar/Reativar rifa (admin/vendedor)

### 🎫 **Bilhetes**
- **Base URL**: `/api/bilhetes`
- **Arquivo**: `bilhetes.js`
- **Rotas**:
  - `GET /rifa/:rifaId` - Listar bilhetes de uma rifa (todos)
  - `GET /rifa/:rifaId/disponiveis` - Números disponíveis (todos)
  - `GET /participante/:participanteId` - Bilhetes por participante (todos)
  - `POST /rifa/:rifaId/numero/:numero/reservar` - Reservar bilhete (admin/vendedor)
  - `POST /rifa/:rifaId/numero/:numero/vender` - Vender bilhete (admin/vendedor)
  - `DELETE /rifa/:rifaId/numero/:numero/cancelar-reserva` - Cancelar reserva (admin/vendedor)
  - `POST /rifa/:rifaId/numero/:numero/estornar` - Estornar bilhete (admin/vendedor)

### 🎲 **Sorteios**
- **Base URL**: `/api/sorteios`
- **Arquivo**: `sorteios.js`
- **Rotas**:
  - `GET /` - Listar sorteios (todos)
  - `GET /:id` - Buscar sorteio por ID (todos)
  - `GET /rifa/:rifaId` - Sorteio por rifa (todos)
  - `GET /estatisticas/geral` - Estatísticas gerais (todos)
  - `POST /rifa/:rifaId/realizar` - Realizar sorteio (admin/vendedor)
  - `PATCH /:id/confirmar-entrega` - Confirmar entrega (admin/vendedor)
  - `DELETE /:id` - Cancelar sorteio (admin/vendedor)

### 💰 **Pagamentos**
- **Base URL**: `/api/pagamentos`
- **Arquivo**: `pagamentos.js`
- **Rotas**:
  - `GET /` - Listar pagamentos
  - `GET /:id` - Buscar pagamento por ID
  - `PATCH /:id/confirmar` - Confirmar pagamento
  - `PATCH /:id/cancelar` - Cancelar pagamento
  - `PATCH /:id/estornar` - Estornar pagamento
  - `GET /relatorio/periodo` - Relatório por período
  - `GET /estatisticas/geral` - Estatísticas de pagamentos

### 📊 **Dashboard**
- **Base URL**: `/api/dashboard`
- **Arquivo**: `dashboard.js`
- **Rotas**:
  - `GET /dashboard` - Estatísticas gerais do dashboard
  - `GET /relatorio/vendas` - Relatório de vendas por período

## 🔒 **Controle de Acesso**

### **Perfis de Usuário**
- **admin**: Acesso total ao sistema
- **vendedor**: Pode criar rifas, vender bilhetes e realizar sorteios
- **visualizador**: Apenas visualizar dados

### **Middleware de Autenticação**
- **authMiddleware**: Verifica se o usuário está logado
- **requireAdmin**: Requer perfil de admin
- **requireAdminOrVendedor**: Requer perfil de admin ou vendedor
- **requireActiveUser**: Verifica se o usuário está ativo

### **Permissões por Rota**

#### **Acesso Livre (após login)**
- Visualizar rifas, bilhetes, sorteios
- Ver estatísticas e relatórios
- Buscar participantes

#### **Admin e Vendedor**
- Criar e gerenciar rifas
- Vender e estornar bilhetes
- Realizar sorteios
- Gerenciar pagamentos

#### **Apenas Admin**
- Criar e gerenciar usuários
- Ativar/desativar usuários
- Acesso a relatórios administrativos

## 📝 **Formato das Respostas**

### **Sucesso**
```json
{
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### **Lista com Paginação**
```json
{
  "items": [...],
  "totalCount": 100,
  "currentPage": 1,
  "totalPages": 10
}
```

### **Erro**
```json
{
  "error": "Mensagem de erro descritiva"
}
```

## 🔧 **Parâmetros de Query Comuns**

- **page**: Número da página (padrão: 1)
- **limit**: Itens por página (padrão: 10)
- **search**: Busca por texto
- **status**: Filtro por status
- **dataInicio/dataFim**: Filtro por período

## 🚀 **Como Usar**

### **Exemplo de Requisição**
```javascript
// Criar uma rifa
fetch('/api/rifas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer seu-token-jwt'
  },
  body: JSON.stringify({
    titulo: 'Rifa do Carro',
    premio: 'Carro 0km',
    valorBilhete: 10.00,
    quantidadeNumeros: 1000,
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31'
  })
});
```

### **Exemplo de Resposta**
```json
{
  "id": 1,
  "titulo": "Rifa do Carro",
  "premio": "Carro 0km",
  "valorBilhete": 10.00,
  "quantidadeNumeros": 1000,
  "status": "ativa",
  "bilhetesVendidos": 0,
  "totalArrecadado": 0,
  "percentualVendido": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 **Próximos Passos**

1. **Implementar validações** de entrada (Joi/Yup)
2. **Adicionar rate limiting** para prevenir spam
3. **Criar documentação Swagger** para a API
4. **Implementar logs** de auditoria
5. **Adicionar testes** unitários e de integração
6. **Upload de imagens** para prêmios das rifas

## 📄 **Arquivos Removidos**

- ❌ `eleitorRoutes.js` - Removido (não é mais necessário)
- ✅ `cidadaos.js` → `participantes.js` - Renomeado e atualizado

## 🔍 **Observações**

- Todas as rotas requerem autenticação
- Logs de erro são registrados automaticamente
- Validações de negócio são aplicadas nos controllers
- Middleware de CORS configurado para desenvolvimento
- Tratamento de erros 404 e 500 implementado
