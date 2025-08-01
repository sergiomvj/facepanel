# PanelX Deployment Guide

## 📁 Estrutura de Deploy

O projeto está organizado da seguinte forma:

```
deployment/
├── admin-panel/          # Aplicação Next.js principal
│   ├── src/             # Código fonte
│   ├── public/          # Arquivos estáticos
│   ├── prisma/          # Schema do banco de dados
│   ├── Dockerfile       # Configuração do container
│   └── package.json     # Dependências
├── api/                 # API standalone (opcional)
│   ├── src/             # Código fonte da API
│   ├── routes/          # Rotas da API
│   ├── Dockerfile       # Configuração do container
│   └── package.json     # Dependências
├── frontend/            # Build estático (opcional)
│   └── build/           # Arquivos buildados
├── database/            # Banco de dados
│   ├── custom.db        # Arquivo do SQLite
│   └── migrations/      # Migrações do Prisma
├── storage/             # Armazenamento de arquivos
│   ├── uploads/         # Uploads de usuários
│   ├── logs/           # Logs da aplicação
│   ├── backups/        # Backups
│   └── ssl/            # Certificados SSL
├── docker-compose.yml   # Orquestração dos containers
├── nginx.conf          # Configuração do Nginx
└── deploy.sh           # Script de deploy
```

## 🚀 Como Fazer o Deploy

### Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao servidor com permissões de sudo
- Portas 80, 443, 3000, 3001 liberadas

### Método 1: Usando Docker Compose (Recomendado)

1. **Copie os arquivos para o servidor:**
   ```bash
   scp -r deployment/ user@seu-servidor:/opt/panelx/
   ```

2. **Acesse o servidor:**
   ```bash
   ssh user@seu-servidor
   cd /opt/panelx
   ```

3. **Execute o script de deploy:**
   ```bash
   ./deploy.sh production
   ```

### Método 2: Deploy Manual

1. **Prepare o ambiente:**
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose nodejs npm
   sudo usermod -aG docker $USER
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Inicie os serviços:**
   ```bash
   docker-compose up -d --build
   ```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do deployment:

```env
# Ambiente
NODE_ENV=production
PORT=3000
API_PORT=3001

# Banco de Dados
DATABASE_URL=file:./database/custom.db

# Segurança
JWT_SECRET=sua-chave-secreta-aqui
NEXTAUTH_SECRET=sua-chave-nextauth-aqui
NEXTAUTH_URL=https://seu-dominio.com

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# Logs
LOG_LEVEL=info
LOG_DIR=./storage/logs
```

### Configuração do Nginx

O Nginx atua como reverse proxy:

- **Porta 80:** HTTP (redireciona para HTTPS)
- **Porta 443:** HTTPS (com SSL)
- **Porta 3000:** Admin Panel (interno)
- **Porta 3001:** API (interno)

### SSL/TLS

1. **Gere os certificados:**
   ```bash
   # Usando Let's Encrypt
   sudo apt install certbot
   sudo certbot certonly --standalone -d seu-dominio.com
   ```

2. **Copie os certificados:**
   ```bash
   sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem storage/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem storage/ssl/key.pem
   ```

3. **Habilite o HTTPS no nginx.conf**

## 📊 Monitoramento e Logs

### Verificar status dos containers:
```bash
docker-compose ps
```

### Verificar logs:
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f admin-panel
docker-compose logs -f api
```

### Health Check:
```bash
# Admin Panel
curl http://localhost:3000

# API
curl http://localhost:3001/health
```

## 🔄 Atualizações

### Para atualizar a aplicação:

1. **Faça o pull das alterações:**
   ```bash
   git pull origin main
   ```

2. **Rebuild os containers:**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Para fazer rollback:
```bash
docker-compose down
docker-compose up -d
```

## 🛠️ Manutenção

### Backup do banco de dados:
```bash
# Backup
docker-compose exec admin-panel sqlite3 database/custom.db ".backup storage/backups/backup-$(date +%Y%m%d).db"

# Restore
docker-compose exec admin-panel sqlite3 database/custom.db ".restore storage/backups/backup-YYYYMMDD.db"
```

### Limpeza de logs:
```bash
# Limpar logs antigos
find storage/logs -name "*.log" -mtime +30 -delete
```

### Atualização de dependências:
```bash
# Atualizar pacotes
docker-compose exec admin-panel npm update
docker-compose exec api npm update

# Rebuild
docker-compose build
docker-compose up -d
```

## 🔒 Segurança

### Firewalld (se usar CentOS/RHEL):
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### UFW (se usar Ubuntu/Debian):
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Configurações de segurança adicionais:
- Use senhas fortes
- Configure HTTPS obrigatório
- Limite o acesso por IP
- Use rate limiting
- Mantenha os pacotes atualizados

## 🐛 Troubleshooting

### Problemas comuns:

1. **Container não inicia:**
   ```bash
   docker-compose logs [serviço]
   ```

2. **Porta já em uso:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 [PID]
   ```

3. **Permissões de arquivo:**
   ```bash
   sudo chown -R $USER:$USER deployment/
   chmod -R 755 deployment/storage
   ```

4. **Banco de dados corrompido:**
   ```bash
   docker-compose exec admin-panel sqlite3 database/custom.db ".recover"
   ```

## 📞 Suporte

Se precisar de ajuda:
- Verifique os logs: `docker-compose logs -f`
- Teste a saúde dos serviços: `curl http://localhost:3001/health`
- Reinicie os serviços: `docker-compose restart`
- Consulte a documentação oficial do Next.js e Docker