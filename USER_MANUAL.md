# 📱 Manual de Uso do FacePanel

## Visão Geral

O **FacePanel** é um painel de controle moderno para gerenciamento de projetos, serviços Docker, métricas em tempo real e logs. Este manual irá guiá-lo através de todas as funcionalidades disponíveis.

---

## 🚀 Primeiros Passos

### Acesso ao Sistema

1. **Abra seu navegador** (Chrome, Firefox, Safari, Edge)
2. **Acesse a URL**: `http://seu-servidor.com` ou `http://localhost:8080` (desenvolvimento)
3. **Login**: Use suas credenciais fornecidas pelo administrador

### Interface Principal

A interface é dividida em:
- **Sidebar**: Menu de navegação lateral
- **Header**: Título da seção atual
- **Main Content**: Conteúdo principal da seção
- **Notifications**: Notificações no canto superior direito

---

## 📊 Dashboard (Página Inicial)

### Visão Geral das Métricas

O Dashboard apresenta:

#### **Cards de Status**
- **CPU Usage**: Uso atual do processador
- **Memory Usage**: Uso de memória RAM
- **Disk Usage**: Espaço em disco utilizado
- **Network**: Tráfego de rede atual

#### **Gráficos em Tempo Real**
- **CPU & Memory Usage**: Histórico de uso de recursos
- **Network Traffic**: Tráfego de entrada e saída

#### **Seção de Projetos**
- Lista dos projetos ativos
- Botão "New Project" para criar novos projetos

### Como Usar o Dashboard

1. **Visualizar Métricas**: Os dados são atualizados automaticamente
2. **Alterar Período**: Use os botões "1h", "24h", "7d" nos gráficos
3. **Criar Projeto**: Clique em "New Project" na seção de projetos

---

## 📁 Gerenciamento de Projetos

### Visualizar Projetos

1. **Clique em "Projects"** no menu lateral
2. **Visualize todos os projetos** em cards organizados
3. **Veja informações**:
   - Nome do projeto
   - Descrição
   - Status (Running, Stopped, Error)
   - Data de criação

### Criar Novo Projeto

1. **Clique em "New Project"** (Dashboard ou seção Projects)
2. **Preencha o formulário**:
   - **Nome**: Nome do projeto (obrigatório)
   - **Descrição**: Descrição detalhada
   - **Repositório**: URL do repositório Git
   - **Tipo**: Web App, API, Database, etc.
3. **Clique em "Create Project"**
4. **Aguarde confirmação**: Notificação de sucesso aparecerá

### Controlar Projetos

Para cada projeto, você pode:

#### **Start Project** (Iniciar)
- Clique no botão verde "Start"
- Status mudará para "Starting" → "Running"
- Notificação de confirmação

#### **Stop Project** (Parar)
- Clique no botão vermelho "Stop"
- Status mudará para "Stopping" → "Stopped"
- Notificação de confirmação

#### **Restart Project** (Reiniciar)
- Clique no botão amarelo "Restart"
- Status mudará para "Restarting" → "Running"
- Notificação de confirmação

---

## 🐳 Gerenciamento de Serviços Docker

### Visualizar Serviços

1. **Clique em "Services"** no menu lateral
2. **Veja todos os serviços** listados com:
   - Nome do serviço
   - Imagem Docker
   - Projeto associado
   - Porta de acesso
   - Status atual
   - Informações de template (se aplicável)

### Criar Novo Serviço

1. **Clique em "New Service"** (botão verde)
2. **Preencha o formulário**:

#### **Campos Obrigatórios**:
- **Service Name**: Nome único do serviço
- **Project**: Selecione o projeto associado
- **Service Type**: Escolha o tipo de serviço

#### **Tipos de Serviço Disponíveis**:

##### **Templates Automáticos** (Configuração Automática):
- **Aplicativo**: Aplicação personalizada
- **Supabase (Template)**: Banco Supabase com configuração automática
- **Postgres (Template)**: PostgreSQL com configuração padrão
- **Redis (Template)**: Cache Redis com configuração padrão
- **Box Nodejs (Template)**: Container Node.js pronto para uso
- **Box Nextjs (Template)**: Container Next.js pronto para uso

##### **Tipos Manuais**:
- **Database**: Banco de dados genérico
- **Cache**: Sistema de cache
- **Web Server**: Servidor web
- **API Service**: Serviço de API
- **Message Queue**: Fila de mensagens
- **Monitoring**: Monitoramento

#### **Campos Opcionais**:
- **Docker Image**: Imagem Docker (preenchida automaticamente para templates)
- **Port**: Porta de acesso (preenchida automaticamente para templates)

3. **Clique em "Create Service"**
4. **Aguarde criação**: Serviço aparecerá na lista com status "Creating" → "Running"

### Templates Automáticos - Detalhes

#### **Supabase Template**
- **Imagem**: `supabase/postgres:latest`
- **Porta**: `5432`
- **Variáveis**: Banco, usuário e senha pré-configurados

#### **Postgres Template**
- **Imagem**: `postgres:15-alpine`
- **Porta**: `5432`
- **Variáveis**: Banco de dados padrão configurado

#### **Redis Template**
- **Imagem**: `redis:7-alpine`
- **Porta**: `6379`
- **Variáveis**: Senha padrão configurada

#### **Box Nodejs Template**
- **Imagem**: `node:18-alpine`
- **Porta**: `3000`
- **Variáveis**: Ambiente de desenvolvimento

#### **Box Nextjs Template**
- **Imagem**: `node:18-alpine`
- **Porta**: `3000`
- **Variáveis**: Configuração Next.js

### Controlar Serviços

Para cada serviço, você pode:

#### **Start Service** (Iniciar)
- Clique no botão verde "Start"
- Status mudará para "Starting" → "Running"

#### **Stop Service** (Parar)
- Clique no botão vermelho "Stop"
- Status mudará para "Stopping" → "Stopped"

#### **Restart Service** (Reiniciar)
- Clique no botão amarelo "Restart"
- Status mudará para "Restarting" → "Running"

### Atualizar Lista de Serviços

1. **Clique em "Refresh"** (botão azul)
2. **Aguarde atualização**: Botão mostrará spinner
3. **Lista será atualizada**: Novos serviços aparecerão

---

## 💻 Terminal Integrado

### Acessar Terminal

1. **Clique em "Terminal"** no menu lateral
2. **Modal do terminal** abrirá automaticamente
3. **Terminal estará pronto** para uso

### Comandos Disponíveis

O terminal simula um ambiente Linux com comandos básicos:

#### **Comandos de Sistema**:
- `ls` - Listar arquivos e diretórios
- `pwd` - Mostrar diretório atual
- `whoami` - Mostrar usuário atual
- `date` - Mostrar data e hora
- `uptime` - Mostrar tempo de atividade do sistema

#### **Como Usar**:
1. **Digite o comando** na linha de comando
2. **Pressione Enter** para executar
3. **Veja o resultado** na área de output
4. **Histórico** é mantido durante a sessão

### Fechar Terminal

- **Clique no "X"** no canto superior direito do modal
- **Ou clique fora** do modal para fechar

---

## 📋 Visualização de Logs

### Acessar Logs

1. **Clique em "Logs"** no menu lateral
2. **Modal de logs** abrirá automaticamente
3. **Logs serão carregados** automaticamente

### Tipos de Logs

Os logs são categorizados por:

#### **Níveis de Log**:
- **INFO**: Informações gerais (azul)
- **WARN**: Avisos (amarelo)
- **ERROR**: Erros (vermelho)
- **DEBUG**: Informações de debug (cinza)

#### **Fontes de Log**:
- **System**: Logs do sistema
- **Docker**: Logs dos containers
- **Application**: Logs da aplicação
- **Database**: Logs do banco de dados

### Funcionalidades dos Logs

#### **Visualização**:
- **Timestamp**: Data e hora de cada log
- **Nível**: Tipo de log com cor correspondente
- **Fonte**: Origem do log
- **Mensagem**: Conteúdo do log

#### **Navegação**:
- **Scroll automático**: Novos logs aparecem automaticamente
- **Histórico**: Logs anteriores ficam disponíveis
- **Cores**: Diferenciação visual por tipo

### Fechar Logs

- **Clique no "X"** no canto superior direito do modal
- **Ou clique fora** do modal para fechar

---

## 🔔 Sistema de Notificações

### Tipos de Notificações

#### **Sucesso** (Verde):
- Projeto criado com sucesso
- Serviço iniciado
- Operação concluída

#### **Informação** (Azul):
- Processo em andamento
- Status atualizado
- Navegação entre seções

#### **Aviso** (Amarelo):
- Atenção necessária
- Configuração pendente

#### **Erro** (Vermelho):
- Falha na operação
- Erro de conexão
- Validação de formulário

### Como Funcionam

1. **Aparecem automaticamente** no canto superior direito
2. **Desaparecem após 3-5 segundos**
3. **Podem ser fechadas** clicando no "X"
4. **Múltiplas notificações** são empilhadas

---

## 🎨 Interface e Navegação

### Menu Lateral (Sidebar)

#### **Seções Disponíveis**:
- **Dashboard**: Página inicial com métricas
- **Projects**: Gerenciamento de projetos
- **Services**: Gerenciamento de serviços Docker
- **Terminal**: Terminal integrado
- **Logs**: Visualização de logs

#### **Como Navegar**:
1. **Clique na seção desejada**
2. **Conteúdo principal** será atualizado
3. **Título da página** mudará
4. **Notificação** confirmará navegação

### Responsividade

A interface se adapta a diferentes tamanhos de tela:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado
- **Mobile**: Menu colapsável

---

## ⚡ Funcionalidades em Tempo Real

### WebSocket Connection

O sistema mantém conexão em tempo real para:

#### **Atualizações Automáticas**:
- **Métricas do sistema**: CPU, memória, rede
- **Status de projetos**: Mudanças de estado
- **Status de serviços**: Inicialização, parada
- **Logs em tempo real**: Novos logs aparecem automaticamente

#### **Indicadores de Conexão**:
- **Conectado**: Dados atualizados em tempo real
- **Desconectado**: Modo offline, dados podem estar desatualizados

### Reconexão Automática

Se a conexão for perdida:
1. **Sistema tenta reconectar** automaticamente
2. **Notificação** informa sobre o status
3. **Dados são sincronizados** quando reconectado

---

## 🔧 Configurações e Personalização

### Temas

Atualmente disponível:
- **Dark Theme**: Tema escuro padrão (melhor para uso prolongado)

### Preferências

O sistema lembra:
- **Última seção visitada**
- **Configurações de gráficos**
- **Preferências de visualização**

---

## 🚨 Solução de Problemas

### Problemas Comuns

#### **Página não carrega**:
1. Verifique conexão com internet
2. Atualize a página (F5)
3. Limpe cache do navegador
4. Contate o administrador

#### **Botões não funcionam**:
1. Aguarde carregamento completo
2. Atualize a página
3. Verifique console do navegador (F12)

#### **Dados não atualizam**:
1. Verifique conexão WebSocket
2. Atualize a página
3. Verifique se servidor está online

#### **Formulários não enviam**:
1. Verifique campos obrigatórios
2. Verifique formato dos dados
3. Aguarde processamento
4. Tente novamente

### Atalhos de Teclado

- **F5**: Atualizar página
- **F12**: Abrir ferramentas de desenvolvedor
- **Ctrl+R**: Atualizar página
- **Esc**: Fechar modais

---

## 📞 Suporte e Ajuda

### Canais de Suporte

- **Email**: suporte@facepanel.com
- **Chat**: Disponível no canto inferior direito
- **Documentação**: https://docs.facepanel.com
- **GitHub**: https://github.com/seu-usuario/facepanel

### Informações para Suporte

Ao solicitar suporte, forneça:
- **URL** que está acessando
- **Navegador** e versão
- **Descrição do problema**
- **Passos** para reproduzir
- **Screenshots** se possível

---

## 📚 Glossário

- **Container**: Ambiente isolado para executar aplicações
- **Docker**: Plataforma de containerização
- **WebSocket**: Conexão em tempo real
- **Template**: Configuração pré-definida
- **Service**: Serviço Docker gerenciado
- **Project**: Conjunto de serviços relacionados
- **Metrics**: Métricas de sistema em tempo real
- **Logs**: Registros de atividades do sistema

---

## ✅ Checklist de Uso

### Primeiro Acesso
- [ ] Acessar URL do sistema
- [ ] Fazer login (se necessário)
- [ ] Explorar Dashboard
- [ ] Verificar conexão WebSocket

### Criar Primeiro Projeto
- [ ] Ir para seção Projects
- [ ] Clicar em "New Project"
- [ ] Preencher formulário
- [ ] Confirmar criação
- [ ] Verificar status

### Criar Primeiro Serviço
- [ ] Ir para seção Services
- [ ] Clicar em "New Service"
- [ ] Escolher projeto
- [ ] Selecionar tipo/template
- [ ] Confirmar criação
- [ ] Verificar funcionamento

### Monitoramento
- [ ] Verificar métricas no Dashboard
- [ ] Acessar Terminal
- [ ] Visualizar Logs
- [ ] Testar controles de projeto/serviço

---

**Parabéns! Você está pronto para usar o FacePanel! 🎉**

Para dúvidas adicionais, consulte a documentação completa ou entre em contato com o suporte técnico.
