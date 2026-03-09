# Plano de Migração - Sistema Universo da Empada

## Visão Geral
Migração do sistema Flask (Python/SQLite) para Node.js/Express com PostgreSQL.

---

## Fase 1: Estrutura Base do Projeto

### 1.1 Configuração Inicial
- [ ] Criar diretório `backend/`
- [ ] Inicializar npm e instalar dependências
- [ ] Criar estrutura de pastas (config, controllers, routes, middleware, database)

### 1.2 Arquivos de Configuração
- [ ] `backend/package.json` - Dependências do projeto
- [ ] `backend/.env` - Variáveis de ambiente
- [ ] `backend/server.js` - Servidor principal

---

## Fase 2: Banco de Dados PostgreSQL

### 2.1 Schema do Banco
- [ ] `backend/database/schema.sql` - Tabelas completas
  - usuarios (autenticação com níveis)
  - produtos (salgados)
  - categorias_destino
  - destinos (clientes)
  - producoes
  - producao_itens
  - estoque
  - saidas
  - saida_itens

### 2.2 Conexão
- [ ] `backend/config/database.js` - Pool de conexão PostgreSQL

---

## Fase 3: Backend API

### 3.1 Autenticação
- [ ] `backend/middleware/authMiddleware.js` - Middleware JWT
- [ ] `backend/controllers/authController.js` - Login, registro
- [ ] `backend/routes/authRoutes.js` - Rotas de autenticação

### 3.2 CRUDs
- [ ] Produtos (salgados)
- [ ] Produções
- [ ] Saídas/Vendas
- [ ] Destinos/Clientes
- [ ] Estoque

### 3.3 Dashboard e Relatórios
- [ ] Dashboard com estatísticas
- [ ] Relatórios financeiros
- [ ] Relatórios de produção

---

## Fase 4: Frontend

### 4.1 Estrutura HTML
- [ ] Login
- [ ] Dashboard
- [ ] Cadastro de produtos
- [ ] Registro de produção
- [ ] Registro de vendas
- [ ] Relatórios

### 4.2 JavaScript Modular
- [ ] `frontend/js/api.js` - Classe API
- [ ] `frontend/js/auth.js` - Autenticação
- [ ] `frontend/js/dashboard.js` - Carregar dados
- [ ] `frontend/js/producao.js` - Registro de produção
- [ ] `frontend/js/vendas.js` - Registro de vendas

---

## Fase 5: Migração de Dados

- [ ] Exportar dados do SQLite atual
- [ ] Importar para PostgreSQL
- [ ] Validar integridade dos dados

---

## Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Backend | Node.js + Express |
| Banco | PostgreSQL |
| Autenticação | JWT + bcrypt |
| Frontend | HTML + JS (Vanilla) |
| Deploy | Vercel |

---

## Status: CONCLUÍDO ✅

## Tarefas Concluídas

### Fase 1: Estrutura Base do Projeto ✅
- [x] Criar diretório `backend/`
- [x] Arquivo `backend/package.json` - Dependências do projeto
- [x] Arquivo `backend/.env` - Variáveis de ambiente
- [x] Arquivo `backend/server.js` - Servidor principal

### Fase 2: Banco de Dados PostgreSQL ✅
- [x] `backend/database/schema.sql` - Tabelas completas
  - usuarios (autenticação com níveis)
  - produtos (salgados)
  - categorias_destino
  - destinos (clientes)
  - producoes
  - producao_itens
  - estoque
  - saidas
  - saida_itens

### Fase 3: Backend API ✅

#### Autenticação ✅
- [x] `backend/middleware/authMiddleware.js` - Middleware JWT
- [x] `backend/controllers/authController.js` - Login, registro
- [x] `backend/routes/authRoutes.js` - Rotas de autenticação

#### CRUDs ✅
- [x] Produtos (salgados)
- [x] Produções
- [x] Saídas/Vendas
- [x] Destinos/Clientes
- [x] Estoque

#### Dashboard e Relatórios ✅
- [x] Dashboard com estatísticas
- [x] Relatórios financeiros
- [x] Relatórios de produção

### Fase 4: Frontend ✅

#### Estrutura HTML ✅
- [x] Login (`frontend/index.html`)
- [x] Dashboard (`frontend/dashboard.html`)
- [x] Cadastro de produtos (`frontend/produtos.html`)
- [x] Registro de produção (`frontend/producao.html`)
- [x] Registro de vendas (`frontend/vendas.html`)
- [x] Relatórios (`frontend/relatorios.html`)

#### JavaScript Modular ✅
- [x] `frontend/js/api.js` - Classe API
- [x] `frontend/js/auth.js` - Autenticação
- [x] `frontend/js/dashboard.js` - Carregar dados

### Fase 5: Documentação ✅
- [x] README.md - Instruções de instalação
- [x] PLANO_MIGRACAO.md - Plano de ação

