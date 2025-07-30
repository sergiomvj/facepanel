# 🚀 FacePanel - Cloud Control Panel

<div align="center">

![FacePanel Logo](https://img.shields.io/badge/FacePanel-v1.0.0-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen?style=for-the-badge&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)

**Um painel de controle moderno e intuitivo para gerenciar projetos, serviços e containers em servidores VPS**

[🚀 Instalação Rápida](#-instalação-rápida) • [📖 Documentação](#-documentação) • [🎯 Funcionalidades](#-funcionalidades) • [🛠️ Desenvolvimento](#️-desenvolvimento)

</div>

---

## 📋 Sobre o Projeto

O **FacePanel** é um painel de controle web moderno desenvolvido para simplificar o gerenciamento de projetos e serviços em servidores VPS. Com uma interface intuitiva e recursos avançados, permite controlar containers Docker, monitorar métricas em tempo real e gerenciar deployments de forma eficiente.

### ✨ Principais Características

- 🎨 **Interface Moderna**: Design dark theme com TailwindCSS
- 📊 **Métricas em Tempo Real**: WebSocket para monitoramento live
- 🐳 **Integração Docker**: Gerenciamento completo de containers
- 🚀 **Deploy Simplificado**: Múltiplas opções de deployment
- 🔒 **Seguro**: JWT authentication e headers de segurança
- 📱 **Responsivo**: Funciona perfeitamente em mobile e desktop

---

## 🎯 Funcionalidades

### 📊 Dashboard
- Métricas em tempo real (CPU, Memória, Disco, Rede)
- Gráficos interativos com Chart.js
- Status dos projetos e serviços
- Logs em tempo real

### 📁 Gerenciamento de Projetos
- Criação e controle de projetos
- Start/Stop/Restart de aplicações
- Monitoramento de status
- Logs detalhados

### 🐳 Gerenciamento de Serviços
- **Templates Automáticos**:
  - Supabase (Database + Auth)
  - PostgreSQL (Database)
  - Redis (Cache)
  - Box Node.js (Runtime)
  - Box Next.js (Framework)
  - Aplicativo Personalizado

### 🚀 Opções Avançadas de Deploy
- **Upload ZIP**: Drag & drop de arquivos
- **GitHub Integration**: Deploy direto do repositório
- **Manual Upload**: Upload de múltiplos arquivos
- **Docker Image**: Deploy de imagens personalizadas
- **Git Clone**: Clone de repositórios
- **Custom Dockerfile**: Editor de Dockerfile integrado

### 💻 Terminal Integrado
- Terminal web interativo
- Execução de comandos em tempo real
- Histórico de comandos
- Múltiplas sessões

---

## 🚀 Instalação Rápida

### Opção 1: Instalação Docker Ultra Simples (Recomendada)

```bash
curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/docker-install.sh | bash
```

### Opção 2: Instalação Rápida (Uma Linha)

```bash
curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/quick-install.sh | bash
```

### Opção 3: Instalação Manual com Docker Compose

```bash
git clone https://github.com/seu-usuario/facepanel.git
cd facepanel
cp .env.example .env
docker-compose up -d
```

### Opção 4: Instalação Interativa Completa

```bash
curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/install.sh | bash
```

---

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### Setup Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/facepanel.git
cd facepanel
```

2. **Configure o ambiente**
```bash
cp api/.env.example api/.env
# Edite as variáveis de ambiente conforme necessário
```

3. **Instale as dependências**
```bash
cd api
npm install
cd ../frontend
# Frontend usa CDN, não precisa instalar dependências
```

4. **Inicie os serviços**
```bash
# Backend (Terminal 1)
cd api
node simple-server.js

# Frontend (Terminal 2)
cd frontend
node server.js
```

5. **Acesse o sistema**
```
http://localhost:8080
```

### Estrutura do Projeto

```
facepanel/
├── api/                    # Backend API
│   ├── src/               # Código TypeScript
│   ├── simple-server.js   # Servidor simplificado para testes
│   ├── package.json
│   └── Dockerfile
├── frontend/              # Frontend
│   ├── frontend.html      # Interface principal
│   ├── server.js         # Servidor estático
│   └── Dockerfile
├── nginx/                 # Configuração Nginx
│   └── nginx.conf
├── scripts/              # Scripts de instalação
│   ├── install.sh
│   ├── quick-install.sh
│   └── docker-install.sh
├── docs/                 # Documentação
│   ├── INSTALL.md
│   └── USER_MANUAL.md
├── docker-compose.yml    # Docker Compose
└── README.md
```

---

## 📖 Documentação

- [📋 Manual de Instalação](INSTALL.md)
- [👤 Manual do Usuário](USER_MANUAL.md)
- [🏗️ Especificações do Projeto](PRD.md)

---

## 🌐 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido
- **TypeScript** - Tipagem estática
- **WebSocket** - Comunicação em tempo real
- **JWT** - Autenticação
- **Dockerode** - Integração Docker
- **Supabase** - Database e Auth (opcional)

### Frontend
- **HTML5/CSS3/JavaScript** - Base web
- **TailwindCSS** - Framework CSS
- **Lucide Icons** - Ícones modernos
- **Chart.js** - Gráficos interativos
- **WebSocket API** - Tempo real

### Infraestrutura
- **Docker** - Containerização
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL/TLS
- **Systemd** - Gerenciamento de serviços

---

## 🚀 Deploy em Produção

### Requisitos do Servidor
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- 2GB RAM mínimo (4GB recomendado)
- 20GB espaço em disco
- Docker e Docker Compose

### Configuração SSL/HTTPS
O instalador automático configura SSL com Let's Encrypt:

```bash
# Durante a instalação interativa
curl -fsSL https://raw.githubusercontent.com/seu-usuario/facepanel/main/install.sh | bash
# Informe seu domínio e email quando solicitado
```

### Comandos Úteis

```bash
# Ver status dos serviços
sudo systemctl status facepanel-api facepanel-frontend

# Ver logs em tempo real
sudo journalctl -u facepanel-api -f

# Reiniciar serviços
sudo systemctl restart facepanel-api facepanel-frontend

# Docker Compose
sudo docker-compose logs -f
sudo docker-compose restart
sudo docker-compose down && sudo docker-compose up -d
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use commits semânticos

---

## 📝 Changelog

### v1.0.0 (2025-01-29)
- ✨ Lançamento inicial
- 🎨 Interface moderna com TailwindCSS
- 📊 Dashboard com métricas em tempo real
- 🐳 Gerenciamento de containers Docker
- 🚀 Múltiplas opções de deploy
- 💻 Terminal web integrado
- 🔒 Autenticação JWT
- 📱 Design responsivo

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

- **Sergio Castro** - *Desenvolvimento inicial* - [@seu-usuario](https://github.com/seu-usuario)

---

## 🙏 Agradecimentos

- [Fastify](https://www.fastify.io/) - Framework web rápido
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Ícones modernos
- [Chart.js](https://www.chartjs.org/) - Gráficos interativos
- [Docker](https://www.docker.com/) - Containerização

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[🐛 Reportar Bug](https://github.com/seu-usuario/facepanel/issues) • [💡 Solicitar Feature](https://github.com/seu-usuario/facepanel/issues) • [💬 Discussões](https://github.com/seu-usuario/facepanel/discussions)

</div>
