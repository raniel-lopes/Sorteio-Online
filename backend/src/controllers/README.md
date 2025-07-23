# Controllers do Sistema de Rifas Online

## 📋 Resumo dos Controllers Atualizados

### 1. **ParticipanteController** (antiga CidadaoController)
- **Arquivo**: `participanteController.js`
- **Funcionalidades**:
  - ✅ Criar participante (com validação de CPF único)
  - ✅ Listar participantes (com paginação e busca)
  - ✅ Buscar participante por ID (com bilhetes)
  - ✅ Atualizar participante
  - ✅ Excluir participante (com validação)
  - ✅ Obter estatísticas do participante

### 2. **RifaController** (novo)
- **Arquivo**: `rifaController.js`
- **Funcionalidades**:
  - ✅ Criar rifa (com criação automática de bilhetes)
  - ✅ Listar rifas (com filtros e estatísticas)
  - ✅ Buscar rifa por ID (com relacionamentos)
  - ✅ Atualizar rifa (com validações)
  - ✅ Excluir rifa (com validações)
  - ✅ Pausar/Reativar rifa
  - ✅ Obter estatísticas detalhadas

### 3. **BilheteController** (novo)
- **Arquivo**: `bilheteController.js`
- **Funcionalidades**:
  - ✅ Listar bilhetes por rifa
  - ✅ Reservar bilhete
  - ✅ Vender bilhete (marcar como pago)
  - ✅ Cancelar reserva
  - ✅ Estornar bilhete
  - ✅ Buscar bilhetes por participante
  - ✅ Obter números disponíveis

### 4. **SorteioController** (novo)
- **Arquivo**: `sorteioController.js`
- **Funcionalidades**:
  - ✅ Realizar sorteio (manual/automático/loteria)
  - ✅ Listar sorteios
  - ✅ Buscar sorteio por ID
  - ✅ Buscar sorteio por rifa
  - ✅ Confirmar entrega do prêmio
  - ✅ Cancelar sorteio
  - ✅ Obter estatísticas gerais

### 5. **PagamentoController** (novo)
- **Arquivo**: `pagamentoController.js`
- **Funcionalidades**:
  - ✅ Listar pagamentos (com filtros)
  - ✅ Buscar pagamento por ID
  - ✅ Confirmar pagamento
  - ✅ Cancelar pagamento
  - ✅ Estornar pagamento
  - ✅ Relatório de pagamentos
  - ✅ Obter estatísticas financeiras

### 6. **UsuarioController** (atualizado)
- **Arquivo**: `usuarioController.js`
- **Funcionalidades**:
  - ✅ Criar usuário (com novos campos)
  - ✅ Listar usuários (com filtros)
  - ✅ Buscar usuário por ID
  - ✅ Atualizar usuário
  - ✅ Excluir usuário (com validações)
  - ✅ Ativar/Desativar usuário
  - ✅ Obter estatísticas do usuário
  - ✅ Atualizar dados pessoais
  - ✅ Atualizar senha
  - ✅ Ranking de vendedores

## 🔧 Funcionalidades Implementadas

### **Gestão de Rifas**
- Criação com validações completas
- Geração automática de bilhetes
- Controle de status (ativa/pausada/finalizada)
- Estatísticas em tempo real

### **Venda de Bilhetes**
- Reserva temporária
- Venda com diferentes formas de pagamento
- Controle de vendedores
- Histórico completo

### **Sistema de Sorteios**
- Três métodos de sorteio
- Validações de segurança
- Registro de auditoria
- Controle de entrega de prêmios

### **Controle Financeiro**
- Gestão de pagamentos
- Relatórios detalhados
- Estornos e cancelamentos
- Comissões de vendedores

### **Gestão de Usuários**
- Perfis específicos para rifas
- Controle de permissões
- Estatísticas de performance
- Ranking de vendedores

## 📊 Validações Implementadas

### **Segurança**
- CPF único para participantes
- Usuários únicos
- Validação de senhas
- Controle de acesso por perfil

### **Integridade de Dados**
- Verificação de dependências antes de exclusões
- Validação de status antes de operações
- Controle de bilhetes vendidos
- Auditoria de alterações

### **Regras de Negócio**
- Não excluir com bilhetes vendidos
- Não alterar rifa finalizada
- Não estornar após sorteio
- Controle de números disponíveis

## 🎯 Próximos Passos

1. **Atualizar Routes** para usar os novos controllers
2. **Criar Middleware** de autenticação específico
3. **Implementar Validações** de entrada (Joi/Yup)
4. **Criar Testes** unitários e de integração
5. **Documentar API** (Swagger)

## 🔍 Estrutura de Respostas

### **Sucesso**
```json
{
  "message": "Operação realizada com sucesso",
  "data": { ... },
  "pagination": { ... } // quando aplicável
}
```

### **Erro**
```json
{
  "error": "Mensagem de erro descritiva"
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

## 📝 Observações

- Todos os controllers incluem logs de erro para debug
- Campos sensíveis (como senha) são excluídos das respostas
- Validações impedem operações inválidas
- Estatísticas são calculadas em tempo real
- Suporte a paginação e filtros em listagens
