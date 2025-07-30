-- ===================================================================
-- FACEPANEL DATABASE SETUP
-- Execute este script no SQL Editor do Supabase
-- ===================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABELA: users (Usuários do sistema)
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'devops', 'viewer')) DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABELA: vps (Servidores VPS)
-- ===================================================================
CREATE TABLE IF NOT EXISTS vps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ip INET NOT NULL,
    port INTEGER DEFAULT 22,
    username VARCHAR(100) NOT NULL,
    private_key TEXT, -- Chave SSH (criptografada)
    tags TEXT[] DEFAULT '{}', -- Array de tags
    status VARCHAR(20) CHECK (status IN ('online', 'offline', 'maintenance')) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_vps_ip_port UNIQUE (ip, port)
);

-- ===================================================================
-- TABELA: vps_stats (Estatísticas de monitoramento)
-- ===================================================================
CREATE TABLE IF NOT EXISTS vps_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vps_id UUID REFERENCES vps(id) ON DELETE CASCADE,
    
    -- CPU
    cpu_usage DECIMAL(5,2) NOT NULL, -- Porcentagem de uso
    cpu_cores INTEGER NOT NULL,
    
    -- Memória
    memory_used BIGINT NOT NULL, -- Bytes
    memory_total BIGINT NOT NULL, -- Bytes
    memory_percentage DECIMAL(5,2) NOT NULL,
    
    -- Disco
    disk_used BIGINT NOT NULL, -- Bytes
    disk_total BIGINT NOT NULL, -- Bytes
    disk_percentage DECIMAL(5,2) NOT NULL,
    
    -- Rede
    network_bytes_in BIGINT NOT NULL,
    network_bytes_out BIGINT NOT NULL,
    
    -- Sistema
    uptime BIGINT NOT NULL, -- Segundos
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABELA: docker_containers (Containers Docker)
-- ===================================================================
CREATE TABLE IF NOT EXISTS docker_containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vps_id UUID REFERENCES vps(id) ON DELETE CASCADE,
    container_id VARCHAR(64) NOT NULL, -- Docker container ID
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('running', 'stopped', 'paused', 'restarting')) NOT NULL,
    ports TEXT[] DEFAULT '{}', -- Array de portas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_container_per_vps UNIQUE (vps_id, container_id)
);

-- ===================================================================
-- TABELA: service_templates (Templates de serviços)
-- ===================================================================
CREATE TABLE IF NOT EXISTS service_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    docker_compose TEXT NOT NULL, -- YAML do docker-compose
    variables JSONB NOT NULL DEFAULT '[]', -- Variáveis do template
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABELA: installations (Histórico de instalações)
-- ===================================================================
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vps_id UUID REFERENCES vps(id) ON DELETE CASCADE,
    template_id UUID REFERENCES service_templates(id),
    service_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    variables JSONB DEFAULT '{}', -- Variáveis usadas na instalação
    logs TEXT[] DEFAULT '{}', -- Array de logs
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id)
);

-- ===================================================================
-- TABELA: alerts (Alertas do sistema)
-- ===================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vps_id UUID REFERENCES vps(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('cpu', 'memory', 'disk', 'service', 'connectivity')) NOT NULL,
    severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ===================================================================
-- TABELA: action_logs (Logs de ações dos usuários)
-- ===================================================================
CREATE TABLE IF NOT EXISTS action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL, -- 'vps', 'container', 'template', etc
    resource_id UUID NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- VPS Stats (consultas por tempo e VPS)
CREATE INDEX IF NOT EXISTS idx_vps_stats_vps_id_timestamp ON vps_stats(vps_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vps_stats_timestamp ON vps_stats(timestamp DESC);

-- Containers por VPS
CREATE INDEX IF NOT EXISTS idx_containers_vps_id ON docker_containers(vps_id);

-- Alertas ativos
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(vps_id, acknowledged, created_at DESC) WHERE NOT acknowledged;

-- Logs de ações
CREATE INDEX IF NOT EXISTS idx_action_logs_user_timestamp ON action_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_action_logs_resource ON action_logs(resource, resource_id, timestamp DESC);

-- Instalações por VPS
CREATE INDEX IF NOT EXISTS idx_installations_vps_status ON installations(vps_id, status, started_at DESC);

-- ===================================================================
-- TRIGGERS PARA UPDATED_AT
-- ===================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas relevantes
DROP TRIGGER IF EXISTS update_vps_updated_at ON vps;
CREATE TRIGGER update_vps_updated_at BEFORE UPDATE ON vps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_containers_updated_at ON docker_containers;
CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON docker_containers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON service_templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON service_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- DADOS INICIAIS (SEEDS)
-- ===================================================================

-- Inserir templates padrão
INSERT INTO service_templates (name, description, category, docker_compose, variables, tags) VALUES
(
    'Next.js Application',
    'Deploy a Next.js application with Nginx reverse proxy',
    'Frontend',
    'version: ''3.8''
services:
  {{APP_NAME}}:
    image: node:18-alpine
    container_name: {{APP_NAME}}
    working_dir: /app
    ports:
      - "{{PORT}}:3000"
    environment:
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.{{APP_NAME}}.rule=Host(`{{DOMAIN}}`)"
      - "traefik.http.routers.{{APP_NAME}}.entrypoints=websecure"
      - "traefik.http.routers.{{APP_NAME}}.tls.certresolver=letsencrypt"
    restart: unless-stopped
    networks:
      - traefik

networks:
  traefik:
    external: true',
    '[
        {
            "name": "APP_NAME",
            "label": "Application Name",
            "type": "string",
            "required": true,
            "description": "Name of your Next.js application"
        },
        {
            "name": "DOMAIN",
            "label": "Domain",
            "type": "string",
            "required": true,
            "description": "Domain name for the application"
        },
        {
            "name": "PORT",
            "label": "Port",
            "type": "number",
            "required": false,
            "defaultValue": 3000,
            "description": "Internal port for the Next.js application"
        }
    ]'::jsonb,
    ARRAY['nextjs', 'react', 'frontend']
),
(
    'Ollama AI Server',
    'Self-hosted AI server with Ollama and web interface',
    'AI/ML',
    'version: ''3.8''
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama_{{MODEL_NAME}}
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - ollama

  webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: ollama_webui
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - webui_data:/app/backend/data
    depends_on:
      - ollama
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ollama-ui.rule=Host(`{{DOMAIN}}`)"
      - "traefik.http.routers.ollama-ui.entrypoints=websecure"
      - "traefik.http.routers.ollama-ui.tls.certresolver=letsencrypt"
    networks:
      - ollama
      - traefik

volumes:
  ollama_data:
  webui_data:

networks:
  ollama:
    driver: bridge
  traefik:
    external: true',
    '[
        {
            "name": "MODEL_NAME",
            "label": "Model Name",
            "type": "select",
            "required": true,
            "options": ["llama2", "mistral", "codellama", "vicuna"],
            "defaultValue": "mistral",
            "description": "AI model to download and run"
        },
        {
            "name": "DOMAIN",
            "label": "Domain",
            "type": "string",
            "required": true,
            "description": "Domain name for Ollama interface"
        }
    ]'::jsonb,
    ARRAY['ollama', 'ai', 'llm', 'machine-learning']
) ON CONFLICT DO NOTHING;

-- ===================================================================
-- RLS (Row Level Security) - Configurar se necessário
-- ===================================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessário)
-- Por exemplo: usuários só podem ver seus próprios dados

-- ===================================================================
-- VIEWS ÚTEIS
-- ===================================================================

-- View para estatísticas recentes de VPS
CREATE OR REPLACE VIEW vps_latest_stats AS
SELECT DISTINCT ON (vps_id) 
    vps_id,
    cpu_usage,
    cpu_cores,
    memory_used,
    memory_total,
    memory_percentage,
    disk_used,
    disk_total,
    disk_percentage,
    network_bytes_in,
    network_bytes_out,
    uptime,
    timestamp
FROM vps_stats 
ORDER BY vps_id, timestamp DESC;

-- View para alertas ativos
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    a.*,
    v.name as vps_name,
    v.ip as vps_ip
FROM alerts a
JOIN vps v ON a.vps_id = v.id
WHERE NOT a.acknowledged
ORDER BY a.severity DESC, a.created_at DESC;

-- ===================================================================
-- FUNÇÕES ÚTEIS
-- ===================================================================

-- Função para limpar estatísticas antigas (manter apenas 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_stats()
RETURNS void AS $$
BEGIN
    DELETE FROM vps_stats 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- FINALIZADO
-- ===================================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'vps', 'vps_stats', 'docker_containers', 'service_templates', 'installations', 'alerts', 'action_logs')
ORDER BY table_name;
