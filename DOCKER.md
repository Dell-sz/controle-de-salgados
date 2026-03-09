# Executando com Docker

## Pré-requisitos
- Docker instalado
- Docker Compose instalado

## Como rodar

1. Na raiz do projeto, execute:

```bash
docker-compose up --build
```

2. Acesse o frontend em: `http://localhost:3000`

## Comandos úteis

### Iniciar os containers
```bash
docker-compose up
```

### Iniciar em background
```bash
docker-compose up -d
```

### Parar os containers
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

### Rebuild (após mudanças)
```bash
docker-compose up --build
```

## Observações

- O banco de dados SQLite será criado automaticamente na pasta `backend/database/`
- O container está configurado para usar `nodemon` em modo de desenvolvimento
- Alterações nos arquivos serão refletidas automaticamente (hot reload)

