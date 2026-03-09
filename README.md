# Sistema Universo da Empada - Node.js/Express

Sistema de gestão completo para empreendimento de empadas, migrado de Flask (Python) para Node.js/Express com PostgreSQL.

## 🚀 Tecnologias

- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT + bcrypt
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Segurança:** Helmet, CORS, Rate Limiting

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

### 1. Instalar dependências do backend

```bash
cd backend
npm install
```

### 2. Configurar banco de dados PostgreSQL

Crie o banco de dados:

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE universo_empada;

# Saia do psql
\q
```

### 3. Criar as tabelas

```bash
cd backend
psql -U postgres -d universo_empada -f database/schema.sql
```

### 4. Configurar variáveis de ambiente

Edite o arquivo `backend/.env` com suas configurações:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=universo_empada
DB_PASSWORD=sua_senha
DB_PORT=5432
JWT_SECRET=sua_chave_secreta_aqui
PORT=3000
```

### 5. Criar usuário admin inicial

O sistema não cria usuário automaticamente por segurança. 
Você pode criar via API após iniciar o servidor:

```bash
# Inicie o servidor
npm start

# Em outro terminal, crie o usuário admin
curl -X POST http://localhost:3000/api/auth/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{"nome":"Administrador","email":"admin@universoempada.com.br","senha":"admin123","tipo":"admin"}'
```

Ou use um cliente REST como Postman ou Insomnia.

### 6. Iniciar o servidor

```bash
cd backend
npm start
```

O servidor estará disponível em: `http://localhost:3000`

### 7. Acessar o frontend

Abra o arquivo `frontend/index.html` em um navegador ou use um servidor HTTP:

```bash
# Com Python (na pasta frontend)
python -m http.server 5500

# Com Node.js
npx http-server -p 5500
```

Acesse: `http://localhost:5500`

## 📁 Estrutura do Projeto

```
projetos/
├── backend/
│   ├── config/
│   │   └── database.js      # Conexão PostgreSQL
│   ├── controllers/        # Lógica de negócio
│   │   ├── authController.js
│   │   ├── produtoController.js
│   │   ├── producaoController.js
│   │   ├── saidaController.js
│   │   ├── dashboardController.js
│   │   ├── destinoController.js
│   │   └── relatorioController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # Autenticação JWT
│   ├── routes/             # Rotas da API
│   ├── database/
│   │   └── schema.sql     # Schema PostgreSQL
│   ├── server.js           # Servidor principal
│   ├── package.json
│   └── .env               # Variáveis de ambiente
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js         # Classe API
│   │   ├── auth.js        # Autenticação
│   │   └── dashboard.js
│   ├── index.html         # Login
│   ├── dashboard.html
│   ├── produtos.html
│   ├── producao.html
│   ├── vendas.html
│   └── relatorios.html
│
├── PLANO_MIGRACAO.md
└── README.md
```

## 🔐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/usuarios` - Criar usuário (admin)

### Produtos
- `GET /api/produtos` - Listar produtos
- `GET /api/produtos/estoque` - Listar estoque
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto

### Produções
- `GET /api/producoes` - Listar produções
- `POST /api/producoes` - Criar produção
- `DELETE /api/producoes/:id` - Excluir produção

### Vendas/Saídas
- `GET /api/saidas` - Listar vendas
- `POST /api/saidas` - Criar venda
- `PUT /api/saidas/:id/status` - Atualizar status

### Dashboard
- `GET /api/dashboard` - Dados do dashboard

### Relatórios
- `GET /api/relatorios/vendas` - Relatório de vendas
- `GET /api/relatorios/producao` - Relatório de produção
- `GET /api/relatorios/produtos` - Relatório por produto

## 📊 Funcionalidades

- ✅ Autenticação JWT com níveis de acesso (admin, supervisor, operador)
- ✅ Cadastro e gestão de produtos
- ✅ Registro de produções com controle de massa e recheio
- ✅ Registro de vendas com controle de estoque
- ✅ Dashboard com estatísticas em tempo real
- ✅ Relatórios de vendas, produção e produtos
- ✅ Controle de estoque com alertas de mínimo
- ✅ Gestão de destinos/clientes
- ✅ Formas de pagamento variadas
- ✅ Controle de pagamentos pendentes

## 🔄 Migração de Dados

Se você estava usando o sistema Flask anterior:

1. Exporte os dados do banco SQLite
2. Converta para o formato do novo schema
3. Importe para o PostgreSQL

Consulte o arquivo `database/schema.sql` para ver a estrutura das tabelas.

## 📝 Licença

MIT

