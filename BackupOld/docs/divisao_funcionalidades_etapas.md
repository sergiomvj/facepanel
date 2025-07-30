# 🧩 Regras e Parâmetros Mínimos para Divisão de Funcionalidades em Projetos

Este documento estabelece as diretrizes para **organizar funcionalidades em etapas e microetapas**, mantendo a **coerência, rastreabilidade e qualidade** ao longo do desenvolvimento de qualquer projeto.

---

## 🎯 Objetivos

- Padronizar a decomposição de funcionalidades.
- Facilitar o planejamento, estimativas e testes.
- Promover entregas incrementais e rastreáveis.
- Garantir clareza entre times técnicos e de produto.

---

## 📐 1. Princípios Fundamentais

1. **Modularidade:** cada funcionalidade deve ser autônoma e reusável.
2. **Atomicidade:** cada etapa deve conter apenas uma ação ou resultado claro.
3. **Progressividade:** funcionalidades devem evoluir por camadas funcionais.
4. **Rastreabilidade:** cada parte deve estar conectada ao objetivo de negócio.

---

## 🧱 2. Estrutura de Divisão

Cada funcionalidade deve ser descrita em 3 níveis:

### 🔹 Nível 1: Macroetapa (Módulo)

- Ex: Autenticação, Dashboard, Relatórios
- Define blocos principais do sistema

### 🔹 Nível 2: Funcionalidade

- Ex: Login com e-mail/senha, Visualização de gráficos
- Deve resolver um problema específico

### 🔹 Nível 3: Microetapas (Tarefas)

- Ex: Validação de formulário, Requisição à API, Tratamento de erro
- Tarefas atômicas, executáveis em poucas horas

---

## 📄 3. Modelo de Registro Padrão

Para cada funcionalidade, usar o modelo:

### 🔹 Nome da Funcionalidade

- **Módulo:** (Ex: Autenticação)
- **Objetivo:** (Descrever o valor entregue)
- **Dependências:** (Outras funcionalidades pré-requisito)
- **Entrada esperada:** (Parâmetros, dados)
- **Saída esperada:** (Resultado ou ação)
- **Telas/Interfaces:** (Onde será exibida)
- **Regra de Negócio:** (Condicionais e restrições)

#### Microetapas:
| Ordem | Tarefa                              | Responsável | Tempo Estimado | Status |
|-------|--------------------------------------|-------------|----------------|--------|
| 1     | Criar tela de login                 | Frontend    | 3h             | ⬜      |
| 2     | Configurar rota de autenticação     | Backend     | 2h             | ⬜      |
| 3     | Validar campos                      | Frontend    | 1h             | ⬜      |
| 4     | Integrar com Supabase/Auth Provider | Fullstack   | 2h             | ⬜      |

---

## ✅ 4. Critérios Mínimos para Aprovação

Uma funcionalidade só pode ser marcada como **"Concluída"** quando:

- Todas as microetapas estiverem completas.
- Código revisado e mergeado.
- Testes automatizados com cobertura mínima de 80%.
- Documentação atualizada.
- Validação funcional pelo time de QA ou PO.

---

## 🧠 5. Boas Práticas

- Dividir tarefas grandes em subitens de até 4h de execução.
- Priorizar tarefas críticas ou bloqueadoras.
- Sincronizar nomeação de tarefas com o backlog (ex: Jira, GitHub).
- Usar etiquetas padronizadas por tipo: `frontend`, `backend`, `api`, `infra`, `testes`.

---

## 🧾 6. Exemplo de Organização Visual (Kanban)

| Etapa        | Tarefas                                         |
|--------------|-------------------------------------------------|
| 📥 Backlog   | Criar API de login, Configurar rota `/login`    |
| 🔧 Em Progresso | Validação de formulário, Estilizar UI           |
| ✅ Finalizado | Testes de login, Documentação de endpoint       |


> Este padrão é obrigatório em todos os projetos do time de desenvolvimento e deve ser atualizado com a evolução das práticas internas.

## 📊 Exemplo de Registro: Gráficos de Recursos de VPS

### 🔹 Nome da Funcionalidade


#### Microetapas:
| Ordem | Tarefa                                 | Responsável | Tempo Estimado | Status |
|-------|----------------------------------------|-------------|----------------|--------|
| 1     | Integrar API de monitoramento de VPS   | Backend     | 3h             | ⬜      |
| 2     | Criar componente de gráfico de pizza   | Frontend    | 2h             | ⬜      |
| 3     | Exibir gráficos nos cards de VPS       | Frontend    | 2h             | ⬜      |
| 4     | Implementar atualização automática     | Fullstack   | 2h             | ⬜      |
| 5     | Adicionar alertas visuais              | Frontend    | 1h             | ⬜      |



## 🛡️ Exemplo de Registro: Painel de Gestão de Contas SSH

### 🔹 Nome da Funcionalidade

- **Módulo:** Gerenciamento de VPS
- **Objetivo:** Gerenciar contas SSH (criar, editar, remover, visualizar status e permissões) de cada VPS.
- **Dependências:** Integração SSH, banco de dados de contas, interface de painel.
- **Entrada esperada:** Dados de contas SSH, chaves públicas/privadas.
- **Saída esperada:** Listagem, status e controle das contas SSH.
- **Telas/Interfaces:** Painel de contas SSH por VPS.
- **Regra de Negócio:** Controle de permissões, auditoria de acessos, geração/distribuição de chaves.

#### Microetapas:
| Ordem | Tarefa                                 | Responsável | Tempo Estimado | Status |
|-------|----------------------------------------|-------------|----------------|--------|
| 1     | Modelar estrutura de contas SSH        | Backend     | 2h             | ⬜      |
| 2     | Criar API de gestão de contas SSH      | Backend     | 3h             | ⬜      |
| 3     | Desenvolver painel de contas SSH       | Frontend    | 3h             | ⬜      |
| 4     | Implementar geração/distribuição de chaves | Fullstack   | 2h             | ⬜      |
| 5     | Adicionar auditoria de acessos         | Backend     | 2h             | ⬜      |

---

## 📦 Exemplo de Registro: Controle de Projetos/Serviços por VPS

### 🔹 Nome da Funcionalidade

- **Módulo:** Gerenciamento de VPS
- **Objetivo:** Controlar e monitorar projetos/serviços instalados em cada VPS.
- **Dependências:** API de monitoramento, banco de dados de serviços, painel de VPS.
- **Entrada esperada:** Dados dos serviços/projetos instalados.
- **Saída esperada:** Listagem, status, ações de controle (instalar, remover, reiniciar).
- **Telas/Interfaces:** Card de VPS, painel de serviços.
- **Regra de Negócio:** Registro de status, logs, dependências e permissões.

#### Microetapas:
| Ordem | Tarefa                                 | Responsável | Tempo Estimado | Status |
|-------|----------------------------------------|-------------|----------------|--------|
| 1     | Modelar estrutura de serviços/projetos | Backend     | 2h             | ⬜      |
| 2     | Criar API de controle de serviços      | Backend     | 3h             | ⬜      |
| 3     | Desenvolver painel de serviços por VPS | Frontend    | 3h             | ⬜      |
| 4     | Implementar ações de controle          | Fullstack   | 2h             | ⬜      |
| 5     | Adicionar logs e auditoria             | Backend     | 2h             | ⬜      |

---

## 🧩 Exemplo de Registro: Templates de Instalação de Serviços

### 🔹 Nome da Funcionalidade

- **Módulo:** Instalação de Serviços
- **Objetivo:** Disponibilizar templates/scripts para instalação rápida de serviços populares (Wordpress, ServerWeb, N8N, Evolution, Chatwoot, Portainer).
- **Dependências:** Scripts de instalação, painel de templates, integração com VPS.
- **Entrada esperada:** Seleção do template, parâmetros de instalação.
- **Saída esperada:** Serviço instalado e configurado na VPS.
- **Telas/Interfaces:** Painel de templates, card de VPS.
- **Regra de Negócio:** Validação de pré-requisitos, registro de status, logs de instalação.

#### Microetapas:
| Ordem | Tarefa                                 | Responsável | Tempo Estimado | Status |
|-------|----------------------------------------|-------------|----------------|--------|
| 1     | Criar scripts de instalação para cada serviço | Backend     | 4h             | ⬜      |
| 2     | Desenvolver painel de templates        | Frontend    | 3h             | ⬜      |
| 3     | Integrar execução dos templates        | Fullstack   | 3h             | ⬜      |
| 4     | Implementar logs e feedback visual     | Frontend    | 2h             | ⬜      |
| 5     | Validar pré-requisitos e dependências  | Backend     | 2h             | ⬜      |

