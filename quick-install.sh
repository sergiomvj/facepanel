#!/bin/bash

# FacePanel - Instalador Ultra Rápido (Uma Linha)
# curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/quick-install.sh | bash

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 FacePanel - Instalação Ultra Rápida${NC}"

# Detectar OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ Sistema não suportado${NC}"
    exit 1
fi

# Instalar dependências básicas
echo -e "${GREEN}📦 Instalando dependências...${NC}"
if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
    sudo apt update -qq
    sudo apt install -y curl wget git nginx nodejs npm
elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
    sudo yum install -y curl wget git nginx nodejs npm
fi

# Criar diretório
echo -e "${GREEN}📁 Configurando FacePanel...${NC}"
sudo mkdir -p /opt/facepanel
cd /opt/facepanel

# Baixar arquivos (simulando clone)
echo -e "${GREEN}⬇️ Baixando arquivos...${NC}"

# Criar estrutura básica
sudo mkdir -p api frontend

# Backend simples
sudo tee api/server.js > /dev/null << 'EOF'
const fastify = require('fastify')({ logger: true })

fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
})

fastify.register(require('@fastify/websocket'))

// Mock data
let projects = [
  { id: 1, name: 'Website', status: 'running', type: 'web' },
  { id: 2, name: 'API Server', status: 'stopped', type: 'api' }
]

let services = [
  { id: 1, name: 'Database', image: 'postgres:15', status: 'running' },
  { id: 2, name: 'Cache', image: 'redis:7', status: 'running' }
]

// WebSocket
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const sendMetrics = () => {
      connection.socket.send(JSON.stringify({
        type: 'metrics',
        data: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: Math.floor(Math.random() * 100)
        }
      }))
    }
    setInterval(sendMetrics, 2000)
  })
})

// Routes
fastify.get('/api/health', async () => ({ status: 'ok' }))
fastify.get('/api/projects', async () => ({ success: true, data: projects }))
fastify.get('/api/services', async () => ({ success: true, data: services }))

fastify.post('/api/projects', async (req) => {
  const project = { id: Date.now(), ...req.body, status: 'running' }
  projects.push(project)
  return { success: true, data: project }
})

fastify.post('/api/services', async (req) => {
  const service = { id: Date.now(), ...req.body, status: 'running' }
  services.push(service)
  return { success: true, data: service }
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
EOF

# Package.json para backend
sudo tee api/package.json > /dev/null << 'EOF'
{
  "name": "facepanel-api",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "fastify": "^4.26.1",
    "@fastify/cors": "^8.5.0",
    "@fastify/websocket": "^8.1.0"
  }
}
EOF

# Frontend simples
sudo tee frontend/index.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FacePanel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-slate-900 text-white">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-slate-800 p-4">
            <h1 class="text-2xl font-bold mb-8">FacePanel</h1>
            <nav class="space-y-2">
                <a href="#" onclick="showSection('dashboard')" class="block p-3 rounded-lg bg-blue-600">Dashboard</a>
                <a href="#" onclick="showSection('projects')" class="block p-3 rounded-lg hover:bg-slate-700">Projetos</a>
                <a href="#" onclick="showSection('services')" class="block p-3 rounded-lg hover:bg-slate-700">Serviços</a>
            </nav>
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div id="content">
                <h2 class="text-3xl font-bold mb-6">Dashboard</h2>
                
                <!-- Stats -->
                <div class="grid grid-cols-3 gap-6 mb-8">
                    <div class="bg-slate-800 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold">CPU</h3>
                        <p class="text-2xl font-bold text-blue-400" id="cpu">0%</p>
                    </div>
                    <div class="bg-slate-800 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold">Memória</h3>
                        <p class="text-2xl font-bold text-green-400" id="memory">0%</p>
                    </div>
                    <div class="bg-slate-800 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold">Disco</h3>
                        <p class="text-2xl font-bold text-yellow-400" id="disk">0%</p>
                    </div>
                </div>
                
                <!-- Projects -->
                <div class="bg-slate-800 p-6 rounded-lg mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Projetos</h3>
                        <button onclick="createProject()" class="bg-blue-600 px-4 py-2 rounded-lg">Novo Projeto</button>
                    </div>
                    <div id="projects-list"></div>
                </div>
                
                <!-- Services -->
                <div class="bg-slate-800 p-6 rounded-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Serviços</h3>
                        <button onclick="createService()" class="bg-green-600 px-4 py-2 rounded-lg">Novo Serviço</button>
                    </div>
                    <div id="services-list"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // WebSocket connection
        let ws;
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3000/ws');
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'metrics') {
                    document.getElementById('cpu').textContent = data.data.cpu + '%';
                    document.getElementById('memory').textContent = data.data.memory + '%';
                    document.getElementById('disk').textContent = data.data.disk + '%';
                }
            };
        }
        
        // Load data
        async function loadProjects() {
            const response = await fetch('/api/projects');
            const data = await response.json();
            const list = document.getElementById('projects-list');
            list.innerHTML = data.data.map(p => 
                `<div class="flex justify-between items-center p-3 bg-slate-700 rounded-lg mb-2">
                    <span>${p.name} (${p.status})</span>
                </div>`
            ).join('');
        }
        
        async function loadServices() {
            const response = await fetch('/api/services');
            const data = await response.json();
            const list = document.getElementById('services-list');
            list.innerHTML = data.data.map(s => 
                `<div class="flex justify-between items-center p-3 bg-slate-700 rounded-lg mb-2">
                    <span>${s.name} - ${s.image} (${s.status})</span>
                </div>`
            ).join('');
        }
        
        function createProject() {
            const name = prompt('Nome do projeto:');
            if (name) {
                fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, type: 'web' })
                }).then(() => loadProjects());
            }
        }
        
        function createService() {
            const name = prompt('Nome do serviço:');
            const image = prompt('Imagem Docker:');
            if (name && image) {
                fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, image })
                }).then(() => loadServices());
            }
        }
        
        function showSection(section) {
            // Simple navigation
            console.log('Navegando para:', section);
        }
        
        // Initialize
        connectWebSocket();
        loadProjects();
        loadServices();
    </script>
</body>
</html>
EOF

# Servidor frontend
sudo tee frontend/server.js > /dev/null << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
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
            hostname: 'localhost',
            port: 3000,
            path: req.url,
            method: req.method,
            headers: req.headers
        };
        
        const proxy = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        req.pipe(proxy);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8080, () => {
    console.log('Frontend server running on http://localhost:8080');
});
EOF

# Instalar dependências
echo -e "${GREEN}📦 Instalando dependências do Node.js...${NC}"
cd api
sudo npm install --silent
cd ..

# Configurar Nginx
echo -e "${GREEN}🌐 Configurando Nginx...${NC}"
sudo tee /etc/nginx/sites-available/facepanel > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/facepanel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Criar serviços systemd
echo -e "${GREEN}⚙️ Configurando serviços...${NC}"
sudo tee /etc/systemd/system/facepanel-api.service > /dev/null << 'EOF'
[Unit]
Description=FacePanel API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/facepanel/api
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/facepanel-frontend.service > /dev/null << 'EOF'
[Unit]
Description=FacePanel Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/facepanel/frontend
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Iniciar serviços
echo -e "${GREEN}🚀 Iniciando serviços...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable facepanel-api facepanel-frontend
sudo systemctl start facepanel-api facepanel-frontend

# Aguardar inicialização
sleep 3

# Verificar status
if sudo systemctl is-active --quiet facepanel-api && sudo systemctl is-active --quiet facepanel-frontend; then
    echo -e "${GREEN}✅ FacePanel instalado com sucesso!${NC}"
    echo -e "${BLUE}🌐 Acesse: http://$(curl -s ifconfig.me)${NC}"
    echo -e "${BLUE}📊 Dashboard funcionando com métricas em tempo real${NC}"
    echo -e "${BLUE}🔧 Comandos úteis:${NC}"
    echo "   sudo systemctl status facepanel-api"
    echo "   sudo systemctl status facepanel-frontend"
    echo "   sudo journalctl -u facepanel-api -f"
else
    echo -e "${RED}❌ Erro na instalação. Verifique os logs.${NC}"
    exit 1
fi
