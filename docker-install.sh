#!/bin/bash

# FacePanel - Instalação com Docker (Ultra Simples)
# curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/docker-install.sh | bash

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    🐳 FacePanel - Instalação Docker Ultra Simples 🐳    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    log "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    warning "Docker instalado! Faça logout/login para aplicar permissões."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Criar diretório do projeto
PROJECT_DIR="/opt/facepanel"
log "Criando diretório do projeto: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Criar estrutura de arquivos
log "Criando estrutura do projeto..."

# Dockerfile para API
sudo mkdir -p api
sudo tee api/Dockerfile > /dev/null << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Copiar package.json
COPY package.json ./
RUN npm install --production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicialização
CMD ["node", "simple-server.js"]
EOF

# Package.json para API
sudo tee api/package.json > /dev/null << 'EOF'
{
  "name": "facepanel-api",
  "version": "1.0.0",
  "description": "FacePanel Backend API",
  "main": "simple-server.js",
  "dependencies": {
    "fastify": "^4.26.1",
    "@fastify/cors": "^8.5.0",
    "@fastify/websocket": "^8.1.0"
  }
}
EOF

# Servidor API simplificado
sudo tee api/simple-server.js > /dev/null << 'EOF'
const fastify = require('fastify')({ logger: true })

// CORS
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
})

// WebSocket
fastify.register(require('@fastify/websocket'))

// Mock data
let projects = [
  { id: 1, name: 'E-commerce Platform', status: 'running', type: 'web', created: new Date().toISOString() },
  { id: 2, name: 'Personal Blog', status: 'stopped', type: 'static', created: new Date().toISOString() },
  { id: 3, name: 'REST API', status: 'running', type: 'api', created: new Date().toISOString() }
]

let services = [
  { id: 1, name: 'PostgreSQL', image: 'postgres:15', status: 'running', type: 'database', port: 5432 },
  { id: 2, name: 'Redis Cache', image: 'redis:7', status: 'running', type: 'cache', port: 6379 },
  { id: 3, name: 'Nginx', image: 'nginx:alpine', status: 'stopped', type: 'webserver', port: 80 }
]

// WebSocket para métricas em tempo real
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    console.log('WebSocket client connected')
    
    const sendMetrics = () => {
      const metrics = {
        type: 'metrics',
        timestamp: new Date().toISOString(),
        data: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: Math.floor(Math.random() * 100),
          network: Math.floor(Math.random() * 1000)
        }
      }
      
      if (connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify(metrics))
      }
    }
    
    const sendLogs = () => {
      const logLevels = ['info', 'warning', 'error', 'debug']
      const logMessages = [
        'Application started successfully',
        'Database connection established',
        'User authentication completed',
        'Cache updated',
        'Backup process initiated',
        'Service health check passed'
      ]
      
      const log = {
        type: 'log',
        timestamp: new Date().toISOString(),
        data: {
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          message: logMessages[Math.floor(Math.random() * logMessages.length)],
          service: services[Math.floor(Math.random() * services.length)].name
        }
      }
      
      if (connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify(log))
      }
    }
    
    // Enviar métricas a cada 2 segundos
    const metricsInterval = setInterval(sendMetrics, 2000)
    
    // Enviar logs a cada 5 segundos
    const logsInterval = setInterval(sendLogs, 5000)
    
    connection.socket.on('close', () => {
      console.log('WebSocket client disconnected')
      clearInterval(metricsInterval)
      clearInterval(logsInterval)
    })
  })
})

// Routes
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  }
})

fastify.get('/api/projects', async (request, reply) => {
  return { success: true, data: projects, total: projects.length }
})

fastify.get('/api/services', async (request, reply) => {
  return { success: true, data: services, total: services.length }
})

fastify.post('/api/projects', async (request, reply) => {
  const project = {
    id: Date.now(),
    ...request.body,
    status: 'running',
    created: new Date().toISOString()
  }
  projects.push(project)
  return { success: true, data: project }
})

fastify.post('/api/services', async (request, reply) => {
  const service = {
    id: Date.now(),
    ...request.body,
    status: 'running',
    created: new Date().toISOString()
  }
  services.push(service)
  return { success: true, data: service }
})

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 FacePanel API running on http://0.0.0.0:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
EOF

# Dockerfile para Frontend
sudo mkdir -p frontend
sudo tee frontend/Dockerfile > /dev/null << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Copiar arquivos
COPY . .

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080 || exit 1

# Comando de inicialização
CMD ["node", "server.js"]
EOF

# Servidor frontend
sudo tee frontend/server.js > /dev/null << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url.startsWith('/api/') || req.url === '/ws') {
        // Proxy para backend
        const options = {
            hostname: 'facepanel-api',
            port: 3000,
            path: req.url,
            method: req.method,
            headers: req.headers
        };
        
        const proxy = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        proxy.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(500);
            res.end('Internal Server Error');
        });
        
        req.pipe(proxy);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8080, () => {
    console.log('🌐 FacePanel Frontend running on http://0.0.0.0:8080');
});
EOF

# Copiar frontend.html existente ou criar um simples
if [ -f "../frontend/frontend.html" ]; then
    sudo cp ../frontend/frontend.html frontend/index.html
else
    log "Criando frontend básico..."
    sudo tee frontend/index.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FacePanel</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white">
    <div class="container mx-auto p-8">
        <h1 class="text-4xl font-bold mb-8 text-center">🚀 FacePanel</h1>
        <div class="text-center">
            <p class="text-xl mb-4">Sistema instalado com sucesso!</p>
            <p class="text-gray-400">Dashboard em desenvolvimento...</p>
        </div>
    </div>
</body>
</html>
EOF
fi

# Criar diretórios necessários
sudo mkdir -p nginx/logs nginx/ssl

# Criar arquivo .env
sudo tee .env > /dev/null << 'EOF'
# FacePanel Environment Variables
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
POSTGRES_PASSWORD=facepanel123
REDIS_PASSWORD=redis123
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EOF

# Criar docker-compose.yml
sudo tee docker-compose.yml > /dev/null << 'EOF'
version: '3.8'

services:
  facepanel-api:
    build: ./api
    container_name: facepanel-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - facepanel-network

  facepanel-frontend:
    build: ./frontend
    container_name: facepanel-frontend
    restart: unless-stopped
    ports:
      - "8080:8080"
    depends_on:
      - facepanel-api
    networks:
      - facepanel-network

  nginx:
    image: nginx:alpine
    container_name: facepanel-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - facepanel-api
      - facepanel-frontend
    networks:
      - facepanel-network

networks:
  facepanel-network:
    driver: bridge
EOF

# Iniciar serviços
log "Construindo e iniciando containers..."
sudo docker-compose up -d --build

# Aguardar inicialização
log "Aguardando inicialização dos serviços..."
sleep 10

# Verificar status
if sudo docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║            ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    
    log "🎉 FacePanel instalado e funcionando!"
    echo ""
    echo -e "${BLUE}🌐 Acesse: http://$IP${NC}"
    echo -e "${BLUE}📊 API: http://$IP/api/health${NC}"
    echo -e "${BLUE}🔧 Localização: $PROJECT_DIR${NC}"
    echo ""
    echo -e "${YELLOW}📋 Comandos úteis:${NC}"
    echo "   cd $PROJECT_DIR"
    echo "   sudo docker-compose logs -f"
    echo "   sudo docker-compose restart"
    echo "   sudo docker-compose down"
    echo "   sudo docker-compose up -d"
    echo ""
    echo -e "${YELLOW}🔍 Status dos containers:${NC}"
    sudo docker-compose ps
    
else
    error "Falha na instalação. Verifique os logs: sudo docker-compose logs"
fi
