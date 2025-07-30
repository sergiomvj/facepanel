#!/bin/bash

# FacePanel - Instalador Automatizado para VPS
# Compatível com Ubuntu 20.04+, Debian 11+, CentOS 8+

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    ███████╗ █████╗  ██████╗███████╗██████╗  █████╗ ███╗   ║
║    ██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗████╗  ║
║    █████╗  ███████║██║     █████╗  ██████╔╝███████║██╔██╗ ║
║    ██╔══╝  ██╔══██║██║     ██╔══╝  ██╔═══╝ ██╔══██║██║╚██╗║
║    ██║     ██║  ██║╚██████╗███████╗██║     ██║  ██║██║ ╚████║
║    ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝
║                                                           ║
║              Instalador Automatizado para VPS            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use um usuário com sudo."
fi

# Detectar sistema operacional
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Sistema operacional não suportado"
fi

log "Sistema detectado: $OS $VER"

# Configurações
FACEPANEL_USER="facepanel"
FACEPANEL_DIR="/opt/facepanel"
DOMAIN=""
EMAIL=""
USE_SSL=false

# Função para instalar dependências no Ubuntu/Debian
install_deps_ubuntu() {
    log "Atualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    
    log "Instalando dependências..."
    sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw
    
    # Instalar Node.js
    log "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Instalar Docker
    log "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo usermod -aG docker $FACEPANEL_USER 2>/dev/null || true
    
    # Instalar Docker Compose
    log "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
}

# Função para instalar dependências no CentOS/RHEL
install_deps_centos() {
    log "Atualizando sistema..."
    sudo yum update -y
    
    log "Instalando dependências..."
    sudo yum install -y curl wget git nginx certbot python3-certbot-nginx firewalld
    
    # Instalar Node.js
    log "Instalando Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
    
    # Instalar Docker
    log "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo usermod -aG docker $FACEPANEL_USER 2>/dev/null || true
    
    # Instalar Docker Compose
    log "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
}

# Função para criar usuário
create_user() {
    if ! id "$FACEPANEL_USER" &>/dev/null; then
        log "Criando usuário $FACEPANEL_USER..."
        sudo useradd -m -s /bin/bash $FACEPANEL_USER
        sudo usermod -aG docker $FACEPANEL_USER
    else
        log "Usuário $FACEPANEL_USER já existe"
    fi
}

# Função para baixar e configurar FacePanel
setup_facepanel() {
    log "Criando diretório do FacePanel..."
    sudo mkdir -p $FACEPANEL_DIR
    sudo chown $FACEPANEL_USER:$FACEPANEL_USER $FACEPANEL_DIR
    
    log "Clonando repositório do FacePanel..."
    if [ -d "$FACEPANEL_DIR/.git" ]; then
        cd $FACEPANEL_DIR
        sudo -u $FACEPANEL_USER git pull
    else
        sudo -u $FACEPANEL_USER git clone https://github.com/seu-usuario/facepanel.git $FACEPANEL_DIR
    fi
    
    cd $FACEPANEL_DIR
    
    log "Instalando dependências do backend..."
    cd api
    sudo -u $FACEPANEL_USER npm install
    
    log "Configurando arquivo .env..."
    if [ ! -f .env ]; then
        sudo -u $FACEPANEL_USER cp .env.example .env
        
        # Gerar JWT secret
        JWT_SECRET=$(openssl rand -base64 64)
        sudo -u $FACEPANEL_USER sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sudo -u $FACEPANEL_USER sed -i "s/PORT=.*/PORT=3000/" .env
        sudo -u $FACEPANEL_USER sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
    fi
    
    cd ..
}

# Função para configurar serviços systemd
setup_systemd() {
    log "Configurando serviços systemd..."
    
    # Serviço do backend
    sudo tee /etc/systemd/system/facepanel-api.service > /dev/null << EOF
[Unit]
Description=FacePanel API Server
After=network.target

[Service]
Type=simple
User=$FACEPANEL_USER
WorkingDirectory=$FACEPANEL_DIR/api
Environment=NODE_ENV=production
ExecStart=/usr/bin/node simple-server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=facepanel-api

[Install]
WantedBy=multi-user.target
EOF

    # Serviço do frontend
    sudo tee /etc/systemd/system/facepanel-frontend.service > /dev/null << EOF
[Unit]
Description=FacePanel Frontend Server
After=network.target

[Service]
Type=simple
User=$FACEPANEL_USER
WorkingDirectory=$FACEPANEL_DIR/frontend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=facepanel-frontend

[Install]
WantedBy=multi-user.target
EOF

    # Recarregar systemd
    sudo systemctl daemon-reload
    sudo systemctl enable facepanel-api facepanel-frontend
}

# Função para configurar Nginx
setup_nginx() {
    log "Configurando Nginx..."
    
    # Backup da configuração padrão
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup 2>/dev/null || true
    
    # Configuração do FacePanel
    sudo tee /etc/nginx/sites-available/facepanel > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Ativar site
    sudo ln -sf /etc/nginx/sites-available/facepanel /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
}

# Função para configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL
        sudo systemctl start firewalld
        sudo systemctl enable firewalld
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
    fi
}

# Função para configurar SSL
setup_ssl() {
    if [ "$USE_SSL" = true ] && [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
        log "Configurando SSL com Let's Encrypt..."
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
        
        # Configurar renovação automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    fi
}

# Função para iniciar serviços
start_services() {
    log "Iniciando serviços..."
    sudo systemctl start facepanel-api
    sudo systemctl start facepanel-frontend
    
    # Aguardar serviços iniciarem
    sleep 5
    
    # Verificar status
    if sudo systemctl is-active --quiet facepanel-api && sudo systemctl is-active --quiet facepanel-frontend; then
        log "Serviços iniciados com sucesso!"
    else
        error "Falha ao iniciar serviços. Verifique os logs: sudo journalctl -u facepanel-api -u facepanel-frontend"
    fi
}

# Função para mostrar informações finais
show_info() {
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║            🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🎉        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log "FacePanel instalado e configurado!"
    echo ""
    info "📍 Localização: $FACEPANEL_DIR"
    info "👤 Usuário: $FACEPANEL_USER"
    info "🌐 URL: http://${DOMAIN:-$(curl -s ifconfig.me)}"
    if [ "$USE_SSL" = true ]; then
        info "🔒 HTTPS: https://$DOMAIN"
    fi
    echo ""
    info "🔧 Comandos úteis:"
    info "   sudo systemctl status facepanel-api"
    info "   sudo systemctl status facepanel-frontend"
    info "   sudo journalctl -u facepanel-api -f"
    info "   sudo journalctl -u facepanel-frontend -f"
    echo ""
    info "📚 Documentação: $FACEPANEL_DIR/USER_MANUAL.md"
    echo ""
    warning "⚠️  IMPORTANTE: Faça logout e login novamente para aplicar as permissões do Docker"
}

# Menu interativo
interactive_setup() {
    echo ""
    read -p "🌐 Digite seu domínio (ex: facepanel.exemplo.com) [opcional]: " DOMAIN
    
    if [ ! -z "$DOMAIN" ]; then
        read -p "📧 Digite seu email para SSL (Let's Encrypt): " EMAIL
        if [ ! -z "$EMAIL" ]; then
            USE_SSL=true
        fi
    fi
    
    echo ""
    info "Configuração:"
    info "  Domínio: ${DOMAIN:-'IP do servidor'}"
    info "  SSL: ${USE_SSL}"
    echo ""
    
    read -p "Continuar com a instalação? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Instalação cancelada"
    fi
}

# Função principal
main() {
    log "Iniciando instalação do FacePanel..."
    
    # Setup interativo
    interactive_setup
    
    # Instalar dependências baseado no OS
    case "$OS" in
        "Ubuntu"*|"Debian"*)
            install_deps_ubuntu
            ;;
        "CentOS"*|"Red Hat"*)
            install_deps_centos
            ;;
        *)
            error "Sistema operacional não suportado: $OS"
            ;;
    esac
    
    # Configurar sistema
    create_user
    setup_facepanel
    setup_systemd
    setup_nginx
    setup_firewall
    
    if [ "$USE_SSL" = true ]; then
        setup_ssl
    fi
    
    start_services
    show_info
}

# Executar instalação
main "$@"
