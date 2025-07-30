# 🚀 FacePanel - VPS Management Dashboard

![FacePanel Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=FacePanel)

**FacePanel** é um painel inteligente de monitoramento e orquestração de serviços que permite gerenciar múltiplas VPS de forma centralizada e eficiente.

## 🎯 Funcionalidades

- ✅ **Monitoramento em Tempo Real** - CPU, RAM, Disco e Rede
- ✅ **Gerenciamento de VPS** - Cadastro e controle de múltiplas VPS
- ✅ **Instalação de Serviços** - Templates para Next.js, Supabase, Ollama, N8N
- ✅ **Controle de Containers** - Start, stop, restart via Docker
- ✅ **Alertas Inteligentes** - Notificações por uso elevado de recursos
- ✅ **Interface Moderna** - Design responsivo com TailwindCSS
- ✅ **Segurança** - Autenticação JWT e controle de acesso

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: API Routes, SSH2, Node.js
- **Database**: Supabase
- **Monitoramento**: SSH + Agent opcional
- **Orquestração**: Docker, Traefik
- **Gráficos**: Recharts

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seuusuario/facepanel.git
   cd facepanel
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite o arquivo `.env.local` com suas configurações:
   ```env
   NEXTAUTH_SECRET=seu-secret-aqui
   SUPABASE_URL=sua-url-supabase
   SUPABASE_ANON_KEY=sua-chave-supabase
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 📁 Estrutura do Projeto

```
facepanel/
├── docs/                    # Documentação
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── vps/           # Páginas de VPS
│   │   └── install/       # Página de instalação
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários e clientes
│   └── types/             # Definições TypeScript
├── public/                # Arquivos estáticos
└── ...
```

## 🎮 Como Usar

### 1. Cadastrar uma VPS

1. Acesse o dashboard principal
2. Clique em "Adicionar VPS"
3. Preencha os dados: Nome, IP, usuário, chave SSH
4. Teste a conexão
5. Salve a configuração

### 2. Monitorar Recursos

1. Selecione uma VPS na lista
2. Visualize gráficos em tempo real
3. Acompanhe métricas de CPU, RAM e Disco
4. Monitore containers Docker ativos

### 3. Instalar Serviços

1. Acesse "Instalação" no menu
2. Escolha um template (Next.js, Supabase, etc)
3. Preencha as variáveis necessárias
4. Visualize o docker-compose gerado
5. Execute a instalação

### 4. Gerenciar Containers

1. Na página da VPS, veja a lista de containers
2. Use os botões para start/stop/restart
3. Visualize logs em tempo real
4. Monitore o status dos serviços

## 🔧 Templates Disponíveis

| Template | Descrição | Categoria |
|----------|-----------|-----------|
| **Next.js App** | Aplicação React com Nginx | Frontend |
| **Supabase Stack** | PostgreSQL + Auth + API | Database |
| **Ollama AI** | Servidor de IA local | AI/ML |
| **N8N Automation** | Automação de workflows | Automation |

## 🚨 Alertas e Monitoramento

O FacePanel monitora automaticamente:

- **CPU** > 90% - Alerta crítico
- **Memória** > 90% - Alerta crítico  
- **Disco** > 90% - Alerta crítico
- **Serviços inativos** > 5min - Alerta médio
- **Conectividade SSH** - Alerta alto

## 🔒 Segurança

- **Autenticação JWT** para todas as rotas
- **Conexões SSH** apenas com chaves privadas
- **Logs de auditoria** para ações críticas
- **Níveis de permissão**: Admin, DevOps, Viewer
- **Sanitização** de comandos SSH

## 📊 Roadmap

### Versão 1.0 (Atual)
- [x] Dashboard básico
- [x] Monitoramento VPS
- [x] Templates de serviços
- [x] Controle de containers

### Versão 1.1 (Próxima)
- [ ] Autenticação completa
- [ ] Alertas por email/webhook
- [ ] Editor visual de templates
- [ ] Backup automático

### Versão 2.0 (Futuro)
- [ ] Cluster de VPS
- [ ] IA para otimização
- [ ] Mobile app
- [ ] Integração CI/CD

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seuusuario/facepanel/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seuusuario/facepanel/discussions)

## 📞 Contato

- **Email**: seu@email.com
- **LinkedIn**: [Seu LinkedIn](https://linkedin.com/in/seulinkedin)
- **Website**: [seuwebsite.com](https://seuwebsite.com)

---

**Feito com ❤️ para a comunidade DevOps**
