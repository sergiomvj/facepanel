
# 📘 Documento Conceitual do Projeto **FacePanel**

## 📌 Nome do Projeto
**FacePanel** – Painel Inteligente de Monitoramento e Orquestração de Serviços

## 🧭 Objetivo Geral
Construir um **Dashboard Central** em Next.js que permita:
- Monitorar múltiplas VPS em tempo real
- Instalar e gerenciar serviços e aplicações (Docker, Supabase, Next.js, Ollama etc.)
- Automatizar tarefas de provisionamento e manutenção
- Garantir controle operacional centralizado para equipes de desenvolvimento e operações

---

## 🧱 Arquitetura do Sistema

```
[ Usuário ]
     ↓
[ Painel FacePanel (Next.js) ]
     ↓
[ API Interna (API Routes) ]
     ↓
[ Agentes em cada VPS | ou | Conexão via SSH ]
     ↓
[ Sistema da VPS (Docker, OS, Monitoramento) ]
```

---

## 🔐 Controle de Acesso
- Login seguro com autenticação por token (JWT)
- Níveis de permissão: Admin, DevOps, Viewer
- Logs de ações administrativas

---

## 🧠 Lógica Algorítmica (Alta Abstração)

### 1. Cadastro de VPS

```ts
função cadastrarVPS(nome, ip, chaveSSH, tags[]) {
  validarConectividadeSSH(ip, chaveSSH)
  salvarDadosEmDB(nome, ip, chaveSSH, tags)
  instalarAgenteMonitoramentoSeSelecionado()
  retornarStatus("VPS cadastrada com sucesso")
}
```

### 2. Monitoramento Contínuo

```ts
loop a cada 10 segundos por VPS {
  obterDadosDe: CPU, RAM, DISCO, DOCKER, UPTIME
  salvarEmCacheOuDB()
  atualizarInterfaceEmTempoReal()
}
```

### 3. Visualização Gráfica

```ts
função exibirPainelDeVPS(vpsId) {
  dados = buscarEstatisticas(vpsId)
  plotarGrafico(dados.CPU, "CPU Usage")
  plotarGrafico(dados.RAM, "RAM Usage")
  plotarGrafico(dados.DISCO, "Disk Usage")
  listarContainers(dados.docker)
  mostrarLogsRecentes(dados.logs)
}
```

### 4. Instalação de Novo Serviço

```ts
função instalarServico(vpsId, tipoServico, configYaml) {
  verificarTemplate(tipoServico)
  gerarArquivoCompose(configYaml)
  conectarViaSSH(vpsId)
  executar("docker compose up -d")
  registrarInstalacao()
  notificar("Serviço instalado com sucesso")
}
```

### 5. Gerenciamento de Serviços Existentes

```ts
função listarServicos(vpsId) {
  executarComando("docker ps -a", vpsId)
  mapearRetornoEmTabela()
}

função controlarServico(vpsId, containerId, acao) {
  switch(acao) {
    case "start": executar("docker start " + containerId)
    case "stop": executar("docker stop " + containerId)
    case "restart": executar("docker restart " + containerId)
  }
}
```

### 6. Histórico e Log de Ações

```ts
função registrarAcao(usuario, tipo, detalhe) {
  salvarLog({
    usuario: usuario,
    tipo: tipo,
    detalhe: detalhe,
    timestamp: now()
  })
}
```

### 7. Templates Inteligentes

```ts
função listarTemplatesDisponiveis() {
  return [
    "Supabase Full Stack",
    "Ollama com Mistral",
    "App Next.js com Tailwind",
    "N8N Automação",
    "Chatwoot Suporte"
  ]
}

função gerarTemplate(tipoServico, variaveis) {
  carregarYamlBase(tipoServico)
  substituirVariaveis(variaveis)
  retornarYamlFinal()
}
```

### 8. Integração com Traefik

```ts
função configurarDominio(subdominio, container, porta) {
  criarLabelTraefik(container, subdominio, porta)
  reiniciarTraefik()
  verificarAcesso(subdominio)
}
```

### 9. Acompanhamento de Deploys

```ts
função iniciarDeploy(projetoGit, destinoVPS) {
  clonarRepo(projetoGit)
  verificarDockerfileOuTemplate()
  executarDeploy()
  registrarDeploy()
}
```

### 10. Alertas e Notificações

```ts
if (usoCPU > 90%) {
  enviarAlerta("CPU da VPS X ultrapassou 90%")
}

if (servicoParadoPorXmin) {
  enviarNotificacao("Serviço Y inativo há mais de X minutos")
}
```

---

## 🎨 Interface Gráfica

### Tela Inicial
- Lista das VPS com status visual (ok, alerta, erro)
- Botões: Visualizar, Gerenciar, Instalar Serviço

### Tela de Detalhes da VPS
- Gráficos interativos (CPU, RAM, Disco, Containers ativos)
- Lista de serviços com botões de ação (start, stop, logs)
- Terminal interativo (opcional)

### Tela de Instalação
- Seletor de Template
- Formulário de parâmetros
- Visualização YAML
- Botão “Instalar”

---

## 📁 Estrutura de Arquivos (Next.js App)

```
/app
  /vps/[id]
  /install
  /monitor
/api
  /vps/[id]/status.ts
  /vps/[id]/install.ts
/components
  VpsCard.tsx
  ResourceMonitor.tsx
  ServiceInstaller.tsx
/lib
  sshClient.ts
  agentApi.ts
  dockerTemplates.ts
/styles
  globals.css
```

---

## 🛠️ Tecnologias Usadas

- **Frontend**: Next.js 14, TailwindCSS, Chart.js/Recharts
- **Backend**: API Routes + SSH (node-ssh ou ssh2)
- **Armazenamento**: Supabase (temporário ou permanente)
- **Orquestração**: Docker, Traefik
- **Monitoramento**: Agente Node.js ou Node Exporter
- **Segurança**: JWT, SSH com chave, logs de ações

---

## 🧩 Possibilidades Futuras
- Controle por voz/chat (via IA)
- Webhooks de eventos críticos
- Deploy com GitHub Actions ou Web UI
- Cluster de VPS com balanceamento de carga
- Editor visual de fluxos (N8N-like)
