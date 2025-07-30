# 🚀 Manual de Instalação do FacePanel - Servidor

## Pré-requisitos

### Sistema Operacional
- **Linux**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Windows**: Windows Server 2019+ / Windows 10+
- **macOS**: macOS 11+

### Software Necessário
- **Node.js**: v18.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **Docker**: v20.10.0 ou superior
- **Docker Compose**: v2.0.0 ou superior
- **Git**: v2.30.0 ou superior

---

## 📦 Instalação Passo a Passo

### 1. Preparação do Ambiente

#### Linux/macOS:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# ou
sudo yum update -y  # CentOS/RHEL

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows:
```powershell
# Instalar via Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install nodejs docker-desktop git -y
```

### 2. Clone do Repositório

```bash
# Clone do projeto
git clone https://github.com/seu-usuario/facepanel.git
cd facepanel

# Verificar estrutura
ls -la
# Deve conter: api/, frontend/, docker-compose.yml, README.md
```

### 3. Configuração do Backend

```bash
# Navegar para o diretório da API
cd api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # ou vim .env
```

#### Configuração do .env:
```env
# Servidor
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_256_bits

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/facepanel/app.log
```

### 4. Configuração do Frontend

```bash
# Navegar para o diretório frontend
cd ../frontend

# Instalar dependências (se houver package.json)
npm install

# Configurar servidor web
# O frontend usa um servidor Node.js simples
```

### 5. Configuração do Banco de Dados (Supabase)

#### Opção A: Supabase Cloud
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e Service Role Key
4. Execute o schema SQL:

```bash
cd api/supabase
# Copie o conteúdo de schema.sql e execute no SQL Editor do Supabase
```

#### Opção B: Supabase Self-Hosted
```bash
# Usar Docker Compose para Supabase local
git clone https://github.com/supabase/supabase.git
cd supabase/docker
cp .env.example .env
docker-compose up -d
```

### 6. Inicialização com Docker

```bash
# Voltar ao diretório raiz
cd ../

# Construir e iniciar containers
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### 7. Configuração do Nginx (Produção)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Configurar virtual host
sudo nano /etc/nginx/sites-available/facepanel
```

#### Configuração Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/facepanel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL/HTTPS (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Configurações Avançadas

### Systemd Services (Linux)

#### Backend Service:
```bash
sudo nano /etc/systemd/system/facepanel-api.service
```

```ini
[Unit]
Description=FacePanel API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/facepanel/api
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service:
```bash
sudo nano /etc/systemd/system/facepanel-frontend.service
```

```ini
[Unit]
Description=FacePanel Frontend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/facepanel/frontend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar serviços
sudo systemctl enable facepanel-api facepanel-frontend
sudo systemctl start facepanel-api facepanel-frontend
sudo systemctl status facepanel-api facepanel-frontend
```

### Monitoramento e Logs

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/facepanel
sudo chown www-data:www-data /var/log/facepanel

# Configurar logrotate
sudo nano /etc/logrotate.d/facepanel
```

```
/var/log/facepanel/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload facepanel-api facepanel-frontend
    endscript
}
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Docker
```bash
# Verificar se Docker está rodando
sudo systemctl status docker
sudo systemctl start docker

# Verificar permissões
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Erro de Porta em Uso
```bash
# Verificar portas em uso
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8080

# Matar processo se necessário
sudo kill -9 PID_DO_PROCESSO
```

#### 3. Erro de Permissões
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/www/facepanel
sudo chmod -R 755 /var/www/facepanel
```

#### 4. Erro de Memória
```bash
# Verificar uso de memória
free -h
df -h

# Aumentar swap se necessário
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📊 Verificação da Instalação

### Testes de Conectividade

```bash
# Testar API
curl http://localhost:3000/api/health

# Testar Frontend
curl http://localhost:8080

# Testar WebSocket
wscat -c ws://localhost:3000/ws
```

### Logs de Verificação

```bash
# Logs do sistema
sudo journalctl -u facepanel-api -f
sudo journalctl -u facepanel-frontend -f

# Logs da aplicação
tail -f /var/log/facepanel/app.log

# Logs do Docker
docker-compose logs -f
```

---

## 🔐 Segurança

### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Bloquear portas internas
sudo ufw deny 3000/tcp
sudo ufw deny 8080/tcp
```

### Backup
```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/facepanel"

mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/facepanel_code_$DATE.tar.gz /var/www/facepanel

# Backup do banco (se local)
docker exec postgres_container pg_dump -U postgres facepanel > $BACKUP_DIR/facepanel_db_$DATE.sql

# Limpar backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

---

## ✅ Checklist Final

- [ ] Node.js e npm instalados
- [ ] Docker e Docker Compose funcionando
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase configurado
- [ ] Containers rodando
- [ ] Nginx configurado (produção)
- [ ] SSL configurado (produção)
- [ ] Serviços systemd ativos
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Testes de conectividade OK

---

## 📞 Suporte

Para suporte técnico:
- **Email**: suporte@facepanel.com
- **GitHub Issues**: https://github.com/seu-usuario/facepanel/issues
- **Documentação**: https://docs.facepanel.com

---

**Instalação concluída com sucesso! 🎉**
