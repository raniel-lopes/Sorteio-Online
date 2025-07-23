-- Criando tabela sorteios
CREATE TABLE IF NOT EXISTS sorteios (
    id SERIAL PRIMARY KEY,
    "rifaId" INTEGER NOT NULL,
    "numeroSorteado" INTEGER NOT NULL,
    "bilheteGanhadorId" INTEGER,
    "ganhadorNome" VARCHAR(255),
    "ganhadorCelular" VARCHAR(255),
    "ganhadorEmail" VARCHAR(255),
    "dataSorteio" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "metodoSorteio" VARCHAR(50) DEFAULT 'automatico',
    "numeroLoteria" VARCHAR(255),
    "observacoes" TEXT,
    "premioEntregue" BOOLEAN DEFAULT FALSE,
    "dataEntregaPremio" TIMESTAMP WITH TIME ZONE,
    "realizadoPor" INTEGER NOT NULL,
    "videoSorteio" VARCHAR(255),
    "numerosSorteados" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criando tabela bilhetes se não existir
CREATE TABLE IF NOT EXISTS bilhetes (
    id SERIAL PRIMARY KEY,
    "rifaId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "participanteId" INTEGER,
    "status" VARCHAR(50) DEFAULT 'disponivel',
    "valorPago" DECIMAL(10,2),
    "dataPagamento" TIMESTAMP WITH TIME ZONE,
    "vendidoPor" INTEGER,
    "metodoPagamento" VARCHAR(50),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criando tabela pagamentos se não existir
CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    "bilheteId" INTEGER NOT NULL,
    "participanteId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pendente',
    "metodoPagamento" VARCHAR(50),
    "dataPagamento" TIMESTAMP WITH TIME ZONE,
    "comprovante" VARCHAR(255),
    "observacoes" TEXT,
    "processadoPor" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criando tabela participantes se não existir
CREATE TABLE IF NOT EXISTS participantes (
    id SERIAL PRIMARY KEY,
    "nomeCompleto" VARCHAR(255) NOT NULL,
    "celular" VARCHAR(20),
    "email" VARCHAR(255),
    "cpf" VARCHAR(14),
    "endereco" TEXT,
    "dataNascimento" DATE,
    "ativo" BOOLEAN DEFAULT TRUE,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
