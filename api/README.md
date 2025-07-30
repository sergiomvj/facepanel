# PanelX API

Backend API para o PanelX - Sistema de gerenciamento de projetos e serviços Docker.

## 🚀 Funcionalidades

- **Gerenciamento de Projetos**: Criar, listar, editar e excluir projetos
- **Gerenciamento de Serviços**: Controlar containers Docker (start, stop, logs)
- **Métricas em Tempo Real**: Monitoramento de CPU, memória e rede
- **Autenticação JWT**: Sistema seguro de autenticação
- **WebSocket**: Comunicação em tempo real para logs e métricas
- **Upload de Arquivos**: Gerenciamento de arquivos por projeto
- **Multi-tenant**: Suporte a múltiplos usuários e projetos

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** (Framework web)
- **Supabase** (Banco de dados e autenticação)
- **Docker** (Containerização e orquestração)
- **JWT** (Autenticação)
- **WebSocket** (Comunicação em tempo real)

## 📁 Estrutura do Projeto

```
api/
├── src/
│   ├── config/         # Configurações (Supabase, env)
│   ├── controllers/    # Controladores das rotas
│   ├── middlewares/    # Middlewares (auth, errorHandler)
│   ├── routes/         # Definição das rotas
│   ├── services/       # Serviços (Docker, métricas, Supabase)
│   ├── utils/          # Utilitários (logger, validators)
│   └── index.ts        # Ponto de entrada
├── supabase/
│   └── schema.sql      # Schema do banco de dados
├── .env.example        # Exemplo de variáveis de ambiente
├── Dockerfile          # Configuração Docker
├── docker-compose.yml  # Orquestração de serviços
├── package.json        # Dependências
└── tsconfig.json       # Configuração TypeScript
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
PORT=3000
JWT_SECRET=seu_jwt_secret_super_seguro
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase/schema.sql` no SQL Editor
3. Configure as variáveis de ambiente com as credenciais do projeto

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

### 5. Build para Produção

```bash
npm run build
npm start
```

## 🐳 Docker

### Executar com Docker Compose

```bash
docker-compose up -d
```

### Build da Imagem

```bash
docker build -t panelx-api .
```

## 📡 API Endpoints

### Autenticação
- Todas as rotas requerem autenticação JWT
- Header: `Authorization: Bearer <token>`

### Projetos
- `GET /projects` - Listar projetos do usuário
- `POST /projects` - Criar novo projeto
- `GET /projects/:id` - Obter projeto específico
- `PUT /projects/:id` - Atualizar projeto
- `DELETE /projects/:id` - Excluir projeto

### Serviços
- `GET /services/:projectId/services` - Listar serviços do projeto
- `POST /services/:projectId/services` - Criar novo serviço
- `POST /services/:projectId/services/:serviceId/start` - Iniciar serviço
- `POST /services/:projectId/services/:serviceId/stop` - Parar serviço
- `GET /services/:projectId/services/:serviceId/logs` - Obter logs do serviço

### Métricas
- `GET /metrics/system` - Métricas do sistema
- `GET /metrics/service/:serviceId` - Métricas do serviço
- `GET /metrics/project/:projectId` - Métricas do projeto

### Arquivos
- `POST /files/:projectId/upload` - Upload de arquivo
- `GET /files/:projectId` - Listar arquivos do projeto
- `DELETE /files/:projectId/:fileId` - Excluir arquivo

## 🔒 Segurança

- **Row Level Security (RLS)** no Supabase
- **Autenticação JWT** obrigatória
- **Validação de entrada** em todos os endpoints
- **Isolamento por usuário** - cada usuário só acessa seus próprios recursos

## 📊 Monitoramento

O sistema coleta métricas de:
- CPU e memória do sistema
- Estatísticas dos containers Docker
- Logs de aplicação
- Métricas de rede

## 🚀 Deploy

### Requisitos
- Docker e Docker Compose
- Acesso ao socket Docker (`/var/run/docker.sock`)
- Projeto Supabase configurado

### Variáveis de Ambiente de Produção
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=jwt_secret_muito_seguro_para_producao
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_de_producao
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
