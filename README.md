# PanelX - Painel de Gerenciamento de Containers

PanelX é um painel de gerenciamento de containers Docker completo, construído com Next.js, TypeScript e Tailwind CSS. Oferece uma interface intuitiva para gerenciar serviços, monitorar recursos, acessar terminais e visualizar logs.

## 🚀 Features

- **Dashboard**: Monitoramento de recursos do sistema em tempo real
- **Gerenciamento de Serviços**: Criar, editar, iniciar, parar e remover containers
- **Terminal Web**: Acesso direto aos containers via terminal no navegador
- **Visualizador de Logs**: Logs em tempo real com busca e filtragem
- **Gerenciamento de Domínios**: Configuração de domínios e certificados SSL
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **WebSocket**: Comunicação em tempo real para atualizações instantâneas

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Estilização**: Tailwind CSS 4, shadcn/ui
- **Banco de Dados**: SQLite com Prisma ORM
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **WebSocket**: Socket.IO
- **Deploy**: Docker, Docker Compose

## 📦 Instalação Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker (opcional, para gerenciar containers)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <seu-repositorio>
   cd panelx
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   ```
   http://localhost:3000
   ```

## 🚀 Deploy em Produção

Agora o PanelX suporta **DOIS modos de deploy**:

1. **Modo Simples**: Interface de demonstração com dados simulados
2. **Modo Docker Real**: Gerenciamento completo de containers Docker (recomendado)

### 🐳 Modo Docker Real (Recomendado)

Este modo permite que o PanelX gerencie **containers Docker reais**, incluindo ele mesmo!

#### Features do Modo Docker Real:
- ✅ Gerencia containers Docker reais do servidor
- ✅ Terminal web real com execução de comandos
- ✅ Logs reais e em tempo real
- ✅ Monitoramento de recursos real
- ✅ O próprio PanelX aparece na lista de containers
- ✅ Criar, iniciar, parar, reiniciar containers reais
- ✅ Ver todos os serviços Docker rodando no servidor

#### Passo 1: Copie os arquivos para o servidor

```bash
# Copie a pasta deployment para seu servidor
scp -r deployment/ user@seu-servidor:/opt/panelx/
```

#### Passo 2: Acesse o servidor e execute o script Docker

```bash
# Conecte-se ao servidor
ssh user@seu-servidor

# Navegue até o diretório
cd /opt/panelx/deployment

# Execute o script de deploy com Docker real
chmod +x DEPLOY-DOCKER.sh
./DEPLOY-DOCKER.sh
```

#### Passo 3: Acesse sua aplicação

Abra seu navegador e acesse:
```
http://seu-servidor:3000
```

#### O que você verá:
- **Todos os containers Docker** do seu servidor
- **O próprio PanelX** na lista de containers
- **Terminal real** para cada container
- **Logs reais** de cada serviço
- **Métricas reais** de CPU e memória

### Pré-requisitos do Servidor (Modo Docker)

Antes de executar o deploy, certifique-se de que seu servidor tem:

- **Docker instalado e rodando:**
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

- **Permissões do Docker:**
  ```bash
  sudo usermod -aG docker $USER
  # Faça logout e login novamente
  ```

- **Porta 3000 liberada:**
  ```bash
  # Ubuntu/Debian
  sudo ufw allow 3000
  
  # CentOS/RHEL
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --reload
  ```

### 🔄 Modo Simples (Interface de Demonstração)

Se você quer apenas uma interface de demonstração sem gerenciar containers reais:

#### Passo 1: Copie os arquivos para o servidor

```bash
# Copie a pasta deployment para seu servidor
scp -r deployment/ user@seu-servidor:/opt/panelx/
```

#### Passo 2: Acesse o servidor e execute o script simples

```bash
# Conecte-se ao servidor
ssh user@seu-servidor

# Navegue até o diretório
cd /opt/panelx/deployment

# Execute o script de deploy simples
chmod +x START.sh
./START.sh
```

#### Passo 3: Acesse sua aplicação

Abra seu navegador e acesse:
```
http://seu-servidor:3000
```

### Estrutura de Deploy

```
deployment/
├── admin-panel/    # Aplicação Next.js principal
├── api/           # API standalone (opcional)
├── frontend/      # Build estático (opcional)
├── database/      # Banco de dados SQLite
├── storage/       # Armazenamento de arquivos
├── docker-compose-simple.yml    # Modo simples
├── docker-compose-docker.yml    # Modo Docker real
├── START.sh                     # Script modo simples
├── DEPLOY-DOCKER.sh             # Script modo Docker real
└── README.md
```

### Pré-requisitos do Servidor

Antes de executar o deploy, certifique-se de que seu servidor tem:

- **Docker instalado:**
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```

- **Permissões do Docker:**
  ```bash
  sudo usermod -aG docker $USER
  # Faça logout e login novamente
  ```

- **Porta 3000 liberada:**
  ```bash
  # Ubuntu/Debian
  sudo ufw allow 3000
  
  # CentOS/RHEL
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --reload
  ```

### Método 2: Deploy Manual

Se preferir fazer o deploy manualmente:

#### 1. Prepare o ambiente

```bash
# Crie a estrutura de diretórios
mkdir -p /opt/panelx/{deployment,storage,logs}
cd /opt/panelx/deployment

# Crie os diretórios necessários
mkdir -p storage/{uploads,logs,backups,ssl}
mkdir -p database
chmod -R 755 storage/ database/
```

#### 2. Configure o Docker Compose

Crie o arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  panelx:
    build: ./admin-panel
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/database/custom.db
    volumes:
      - ./database:/app/database
      - ./storage:/app/storage
    restart: unless-stopped
```

#### 3. Build e inicie os containers

```bash
# Build da imagem
docker-compose build

# Inicie os serviços
docker-compose up -d

# Verifique o status
docker-compose ps
```

## 🔧 Configuração

### Variáveis de Ambiente

Você pode configurar o PanelX através das seguintes variáveis de ambiente:

```bash
# Ambiente
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL=file:./database/custom.db

# Segurança
JWT_SECRET=sua-chave-secreta-aqui
NEXTAUTH_SECRET=sua-chave-nextauth-aqui
NEXTAUTH_URL=http://seu-dominio.com

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# Logs
LOG_LEVEL=info
```

### Configuração de Domínio e SSL

Para configurar um domínio próprio e HTTPS:

#### 1. Configure o Nginx como Reverse Proxy

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. Instale o Certificado SSL

```bash
# Instale o Certbot
sudo apt install certbot python3-certbot-nginx

# Gere o certificado
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Monitoramento e Manutenção

### Comandos Úteis

```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs em tempo real
docker-compose logs -f panelx

# Reiniciar a aplicação
docker-compose restart panelx

# Parar todos os serviços
docker-compose down

# Atualizar a aplicação
docker-compose pull
docker-compose up -d --force-recreate
```

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec panelx sqlite3 /app/database/custom.db ".backup" > backup-$(date +%Y%m%d).db

# Restaurar backup
docker-compose exec panelx sqlite3 /app/database/custom.db < backup-YYYYMMDD.db
```

### Limpeza de Logs

```bash
# Limpar logs antigos (mais de 30 dias)
find storage/logs -name "*.log" -mtime +30 -delete

# Limpar logs do Docker
docker system prune -f
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia

```bash
# Verifique os logs
docker-compose logs panelx

# Verifique se as portas estão disponíveis
netstat -tulpn | grep :3000
```

#### 2. Erro de permissão

```bash
# Corrija as permissões
sudo chown -R $USER:$USER /opt/panelx
chmod -R 755 /opt/panelx/storage
chmod 666 /opt/panelx/database/custom.db
```

#### 3. Banco de dados corrompido

```bash
# Verifique o banco de dados
docker-compose exec panelx sqlite3 /app/database/custom.db ".tables"

# Se necessário, recrie o banco
rm database/custom.db
docker-compose restart panelx
```

#### 4. Problemas de memória

```bash
# Aumente a memória disponível para o Docker
# Edite /etc/docker/daemon.json
{
  "memory": "4g",
  "memory-swap": "6g"
}

# Reinicie o Docker
sudo systemctl restart docker
```

### Health Check

Verifique se a aplicação está funcionando corretamente:

```bash
# Health check básico
curl http://localhost:3000

# Verifique os endpoints da API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/services
```

## 🔒 Segurança

### Boas Práticas

1. **Use HTTPS sempre**
   ```bash
   # Configure SSL/TLS
   sudo certbot --nginx -d seu-dominio.com
   ```

2. **Limite o acesso por IP**
   ```nginx
   # No Nginx
   allow seu-ip;
   deny all;
   ```

3. **Configure firewall adequado**
   ```bash
   # UFW (Ubuntu)
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

4. **Mantenha o sistema atualizado**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Use senhas fortes**
   ```bash
   # Gere senhas seguras
   openssl rand -hex 32
   ```

## 📈 Performance

### Otimizações

1. **Aumente o limite de arquivos**
   ```bash
   # Edite /etc/security/limits.conf
   * soft nofile 65536
   * hard nofile 65536
   ```

2. **Configure o Docker para melhor performance**
   ```bash
   # Edite /etc/docker/daemon.json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   ```

3. **Use cache estático**
   ```bash
   # Configure o Nginx para cache
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique os logs: `docker-compose logs -f panelx`
2. Consulte a seção de troubleshooting acima
3. Abra uma issue no repositório
4. Verifique a documentação completa em `deployment/README.md`

---

**Desenvolvido com ❤️ usando Next.js e Docker**