
# 📄 PRD – Product Requirements Document: FacePanel

## 🧾 Visão Geral do Produto
**FacePanel** é um dashboard web moderno e centralizado que permite monitorar, gerenciar e instalar serviços em múltiplas VPS da infraestrutura da empresa. Ele oferece uma interface intuitiva, gráficos em tempo real, templates de instalação inteligente e controle de recursos baseados em containers Docker.

---

## 🎯 Objetivos do Produto
- Fornecer visibilidade em tempo real sobre o estado de todas as VPS da empresa.
- Permitir instalação e orquestração de novos serviços remotamente.
- Reduzir dependência de ferramentas externas (como Portainer e Painéis comerciais).
- Automatizar deploys com segurança e rastreabilidade.

---

## 👥 Público-Alvo
- Desenvolvedores
- DevOps
- Equipe de Suporte Técnico

---

## 💡 Funcionalidades Principais

### 1. Cadastro e Gerenciamento de VPS
- Adicionar novas VPS via IP e chave SSH.
- Testar conectividade.
- Salvar configurações e tags de organização.

### 2. Monitoramento em Tempo Real
- CPU, RAM, Disco, Uptime e Rede.
- Gráficos dinâmicos.
- Status de containers Docker.

### 3. Painel Individual de VPS
- Exibe métricas detalhadas.
- Lista de containers ativos/inativos.
- Logs recentes.

### 4. Instalação de Serviços
- Seletor de templates (Next.js, Supabase, Ollama, etc).
- Preenchimento de variáveis.
- Geração de docker-compose automático.
- Execução remota via SSH.

### 5. Gerenciamento de Serviços
- Iniciar, parar, reiniciar containers.
- Verificar logs.
- Atualizar imagens Docker.

### 6. Alertas e Notificações
- Notificações sobre uso elevado de recursos.
- Alertas de falhas ou serviços inativos.

### 7. Controle de Acesso e Logs
- Login com JWT.
- Papéis de usuário (Admin, DevOps, Viewer).
- Logs de ações críticas.

---

## 📐 Requisitos Técnicos

- **Framework**: Next.js 14+
- **Linguagem**: TypeScript
- **UI**: TailwindCSS, Recharts
- **Monitoramento**: SSH remoto + Agente opcional
- **Orquestração**: Docker + Traefik
- **Autenticação**: JWT
- **Banco de Dados**: Supabase

---

## 📅 Plano de Tarefas

### Etapa 1 – Estrutura Inicial do Projeto
- [ ] Criar estrutura Next.js com App Router
- [ ] Configurar TailwindCSS
- [ ] Criar layout base com Navbar e Sidebar

### Etapa 2 – Cadastro e Gerenciamento de VPS
- [ ] Criar formulário de cadastro de VPS
- [ ] Teste de conexão SSH
- [ ] Tela de listagem de VPS com status

### Etapa 3 – Monitoramento de Recursos
- [ ] Criar agente remoto (Node.js)
- [ ] Criar API `/api/vps/[id]/status`
- [ ] Exibir gráficos de CPU, RAM, Disco
- [ ] Atualização periódica dos dados

### Etapa 4 – Painel Individual da VPS
- [ ] Página `/vps/[id]`
- [ ] Exibir métricas + logs
- [ ] Listar containers Docker
- [ ] Botões de gerenciamento

### Etapa 5 – Instalação de Serviços
- [ ] Criar seletor de template
- [ ] Formulário para variáveis
- [ ] Gerador de docker-compose
- [ ] Envio do arquivo e execução via SSH

### Etapa 6 – Gerenciamento de Containers
- [ ] Comandos start, stop, restart
- [ ] Leitura de logs por container
- [ ] Atualização de imagens

### Etapa 7 – Alertas e Segurança
- [ ] Configurar níveis de acesso
- [ ] Implementar JWT
- [ ] Sistema de logs de ações
- [ ] Alertas de uso e falhas

---

## ✅ Critérios de Aceitação
- Todas as VPS aparecem no painel com dados válidos
- Instalação de serviços ocorre com sucesso
- Controle de containers funcional
- Alertas e autenticação ativos

---

## 📎 Anexos
- Documento Conceitual (facepanel-doc.md)
- Estrutura inicial do projeto (dashboard-base.zip)
