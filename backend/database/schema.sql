-- Schema Completo - Universo da Empada
-- SQLite

-- ============================================
-- TABELAS BASE
-- ============================================

-- Tabela de usuários (autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'operador',
    ativo INTEGER DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP
);

-- Tabela de produtos (salgados)
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    custo_massa DECIMAL(10,2) DEFAULT 0,
    custo_recheio DECIMAL(10,2) DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de destino
CREATE TABLE IF NOT EXISTS categorias_destino (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    cor VARCHAR(20) DEFAULT '#4CAF50'
);

-- Tabela de destinos (clientes)
CREATE TABLE IF NOT EXISTS destinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    categoria_id INTEGER REFERENCES categorias_destino(id),
    endereco TEXT,
    contato VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativo INTEGER DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS DE MOVIMENTAÇÃO
-- ============================================

-- Tabela de produções
CREATE TABLE IF NOT EXISTS producoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    responsavel_id INTEGER REFERENCES usuarios(id),
    massa_produzida DECIMAL(10,2) NOT NULL,
    recheio_produzido DECIMAL(10,2) NOT NULL,
    sobra_massa DECIMAL(10,2) DEFAULT 0,
    sobra_recheio DECIMAL(10,2) DEFAULT 0,
    custo_massa_kg DECIMAL(10,2) DEFAULT 0,
    custo_recheio_kg DECIMAL(10,2) DEFAULT 0,
    custo_embalagem DECIMAL(10,2) DEFAULT 0,
    custo_mao_obra DECIMAL(10,2) DEFAULT 0,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens da produção
CREATE TABLE IF NOT EXISTS producao_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producao_id INTEGER REFERENCES producoes(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    massa_usada DECIMAL(10,2) NOT NULL,
    recheio_usado DECIMAL(10,2) NOT NULL,
    custo_unitario DECIMAL(10,2) DEFAULT 0
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER REFERENCES produtos(id) UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 5,
    lote VARCHAR(50),
    data_validade DATE,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de saídas (vendas)
CREATE TABLE IF NOT EXISTS saidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL,
    destino_id INTEGER REFERENCES destinos(id),
    responsavel_id INTEGER REFERENCES usuarios(id),
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    forma_pagamento VARCHAR(50),
    data_recebimento DATE,
    pago INTEGER DEFAULT 0,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens da saída
CREATE TABLE IF NOT EXISTS saida_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    saida_id INTEGER REFERENCES saidas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_saidas_data ON saidas(data);
CREATE INDEX IF NOT EXISTS idx_saidas_destino ON saidas(destino_id);
CREATE INDEX IF NOT EXISTS idx_producoes_data ON producoes(data);
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_destinos_ativo ON destinos(ativo);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Categorias de destino padrão
INSERT OR IGNORE INTO categorias_destino (nome, descricao, cor) VALUES 
('Lanchonete', 'Lanchonetes e fast-foods', '#2196F3'),
('Mercado', 'Supermercados e mercados', '#4CAF50'),
('Restaurante', 'Restaurantes e cantinas', '#FF9800'),
('Evento', 'Eventos e festas', '#9C27B0'),
('Outros', 'Outros clientes', '#607D8B');

-- Produtos de exemplo
INSERT OR IGNORE INTO produtos (nome, descricao, valor_unitario, custo_massa, custo_recheio) VALUES 
('Empada de Frango', 'Empada tradicional de frango com catupiry', 5.00, 0.50, 1.00),
('Empada de Carne', 'Empada de carne moída temperada', 5.00, 0.50, 1.00),
('Empada de Queijo', 'Empada de queijo mussarela', 5.50, 0.50, 1.20),
('Empada de Palmito', 'Empada de palmito com ervas', 6.00, 0.50, 1.50),
('Empadinha Salgada', 'Versão mini da empada tradicional', 3.00, 0.30, 0.50);

-- Criar estoque inicial para produtos
INSERT OR IGNORE INTO estoque (produto_id, quantidade, estoque_minimo)
SELECT p.id, 0, 5
FROM produtos p
WHERE NOT EXISTS (SELECT 1 FROM estoque e WHERE e.produto_id = p.id);

-- ============================================
-- FIM DO SCHEMA
-- ============================================

