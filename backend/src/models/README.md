# Modelos do Sistema de Rifas Online

## 📋 Resumo dos Modelos Criados

### 1. **Participante** (antiga Cidadao)
- **Campos principais**: nomeCompleto, celular, email, cpf, endereço
- **Novos campos**: totalBilhetes, totalGasto, ativo
- **Removidos**: campos políticos (lider, autoridade, potencialVotos, etc.)

### 2. **Rifa** (novo)
- **Função**: Controla cada rifa criada
- **Campos**: titulo, premio, valorBilhete, quantidadeNumeros, datas, status
- **Status**: ativa, pausada, finalizada, cancelada
- **Métricas**: totalArrecadado, bilhetesVendidos, percentualVendido

### 3. **Bilhete** (novo)
- **Função**: Representa cada número da rifa
- **Campos**: numero, compradorInfo, status, pagamento
- **Status**: disponivel, reservado, pago, cancelado
- **Relacionamentos**: Rifa, Participante, Usuário (vendedor)

### 4. **Sorteio** (novo)
- **Função**: Registro do sorteio realizado
- **Campos**: numeroSorteado, ganhador, dataSorteio, metodoSorteio
- **Métodos**: manual, automatico, loteria_federal
- **Auditoria**: videoSorteio, numerosSorteados (histórico)

### 5. **Pagamento** (novo)
- **Função**: Controle financeiro dos bilhetes
- **Campos**: valor, formaPagamento, status, comprovante
- **Status**: pendente, confirmado, cancelado, estornado
- **Formas**: pix, dinheiro, cartao, transferencia

### 6. **Usuario** (atualizado)
- **Perfis**: admin, vendedor, visualizador
- **Novos campos**: comissao, metaVendas, totalVendas
- **Métricas**: totalBilhetesVendidos

## 🔗 Relacionamentos

```
Usuario (1) -----> (N) Rifa
Usuario (1) -----> (N) Bilhete (vendedor)
Usuario (1) -----> (N) Sorteio (realizador)
Usuario (1) -----> (N) Pagamento (processador)

Rifa (1) -----> (N) Bilhete
Rifa (1) -----> (1) Sorteio
Rifa (1) -----> (N) Pagamento

Participante (1) -----> (N) Bilhete
Participante (1) -----> (N) Pagamento

Bilhete (1) -----> (1) Pagamento
Bilhete (1) -----> (1) Sorteio (ganhador)
```

## 📊 Funcionalidades Suportadas

### ✅ Gestão de Rifas
- Criar rifas com diferentes valores e quantidades
- Controlar status (ativa/pausada/finalizada)
- Upload de imagem do prêmio
- Regulamento personalizado

### ✅ Venda de Bilhetes
- Reserva temporária de números
- Diferentes formas de pagamento
- Controle de vendedores e comissões
- Compra avulsa (sem cadastro) ou com participante

### ✅ Sistema de Sorteios
- Sorteio manual ou automático
- Integração com loteria federal
- Gravação de vídeo do sorteio
- Histórico de números sorteados

### ✅ Controle Financeiro
- Acompanhamento de pagamentos
- Relatórios de vendas
- Comissões de vendedores
- Descontos e promoções

### ✅ Participantes
- Cadastro simplificado
- Histórico de participações
- Controle de gastos totais

## 🔧 Próximos Passos

1. **Atualizar Controllers** para usar os novos modelos
2. **Atualizar Routes** para as novas entidades
3. **Criar Migrations** para o banco de dados
4. **Atualizar Frontend** com as novas telas
5. **Implementar lógica de sorteio**
6. **Sistema de notificações** (WhatsApp/Email)

## 🗑️ Arquivos que Devem Ser Removidos/Renomeados

### Backend:
- `cidadaoController.js` → `participanteController.js`
- `routes/cidadaos.js` → `routes/participantes.js`
- `routes/eleitorRoutes.js` → **REMOVER**

### Frontend:
- `pages/Cidadaos.jsx` → `pages/Participantes.jsx`
- `pages/Aniversariantes.jsx` → **REMOVER**
- `components/CidadaoForm.jsx` → `components/ParticipanteForm.jsx`
- `components/ListaCidadaos.jsx` → `components/ListaParticipantes.jsx`
- `components/EleitorFormAndList.jsx` → **REMOVER**
