import { ServiceTemplate } from '@/types'

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    description: 'Deploy a Next.js application with Nginx reverse proxy',
    category: 'Frontend',
    tags: ['nextjs', 'react', 'frontend'],
    variables: [
      {
        name: 'APP_NAME',
        label: 'Application Name',
        type: 'string',
        required: true,
        description: 'Name of your Next.js application'
      },
      {
        name: 'DOMAIN',
        label: 'Domain',
        type: 'string',
        required: true,
        description: 'Domain name for the application'
      },
      {
        name: 'PORT',
        label: 'Port',
        type: 'number',
        required: false,
        defaultValue: 3000,
        description: 'Internal port for the Next.js application'
      }
    ],
    dockerCompose: `version: '3.8'
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
      - "traefik.http.routers.{{APP_NAME}}.rule=Host(\`{{DOMAIN}}\`)"
      - "traefik.http.routers.{{APP_NAME}}.entrypoints=websecure"
      - "traefik.http.routers.{{APP_NAME}}.tls.certresolver=letsencrypt"
    restart: unless-stopped
    networks:
      - traefik

networks:
  traefik:
    external: true`
  },
  {
    id: 'supabase-stack',
    name: 'Supabase Full Stack',
    description: 'Complete Supabase stack with PostgreSQL, API, and Dashboard',
    category: 'Database',
    tags: ['supabase', 'postgresql', 'database', 'api'],
    variables: [
      {
        name: 'PROJECT_NAME',
        label: 'Project Name',
        type: 'string',
        required: true,
        description: 'Name of your Supabase project'
      },
      {
        name: 'POSTGRES_PASSWORD',
        label: 'PostgreSQL Password',
        type: 'string',
        required: true,
        description: 'Password for PostgreSQL database'
      },
      {
        name: 'JWT_SECRET',
        label: 'JWT Secret',
        type: 'string',
        required: true,
        description: 'Secret key for JWT tokens'
      },
      {
        name: 'DOMAIN',
        label: 'Domain',
        type: 'string',
        required: true,
        description: 'Domain name for Supabase API'
      }
    ],
    dockerCompose: `version: '3.8'
services:
  db:
    image: supabase/postgres:15.1.0.117
    container_name: {{PROJECT_NAME}}_db
    environment:
      POSTGRES_PASSWORD: {{POSTGRES_PASSWORD}}
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - supabase

  auth:
    image: supabase/gotrue:v2.99.0
    container_name: {{PROJECT_NAME}}_auth
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:{{POSTGRES_PASSWORD}}@db:5432/postgres
      GOTRUE_SITE_URL: https://{{DOMAIN}}
      GOTRUE_URI_ALLOW_LIST: ""
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_ADMIN_ROLES: service_role
      GOTRUE_JWT_AUD: authenticated
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_SECRET: {{JWT_SECRET}}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - supabase

  rest:
    image: postgrest/postgrest:v11.2.0
    container_name: {{PROJECT_NAME}}_rest
    environment:
      PGRST_DB_URI: postgres://authenticator:{{POSTGRES_PASSWORD}}@db:5432/postgres
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: {{JWT_SECRET}}
      PGRST_DB_USE_LEGACY_GUCS: "false"
    depends_on:
      - db
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.{{PROJECT_NAME}}-api.rule=Host(\`{{DOMAIN}}\`) && PathPrefix(\`/rest/\`)"
      - "traefik.http.routers.{{PROJECT_NAME}}-api.entrypoints=websecure"
      - "traefik.http.routers.{{PROJECT_NAME}}-api.tls.certresolver=letsencrypt"
    networks:
      - supabase
      - traefik

volumes:
  postgres_data:

networks:
  supabase:
    driver: bridge
  traefik:
    external: true`
  },
  {
    id: 'ollama-ai',
    name: 'Ollama AI Server',
    description: 'Self-hosted AI server with Ollama and web interface',
    category: 'AI/ML',
    tags: ['ollama', 'ai', 'llm', 'machine-learning'],
    variables: [
      {
        name: 'MODEL_NAME',
        label: 'Model Name',
        type: 'select',
        required: true,
        options: ['llama2', 'mistral', 'codellama', 'vicuna'],
        defaultValue: 'mistral',
        description: 'AI model to download and run'
      },
      {
        name: 'DOMAIN',
        label: 'Domain',
        type: 'string',
        required: true,
        description: 'Domain name for Ollama interface'
      }
    ],
    dockerCompose: `version: '3.8'
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
      - "traefik.http.routers.ollama-ui.rule=Host(\`{{DOMAIN}}\`)"
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
    external: true`
  },
  {
    id: 'n8n-automation',
    name: 'N8N Automation Platform',
    description: 'Workflow automation platform with database',
    category: 'Automation',
    tags: ['n8n', 'automation', 'workflow', 'integration'],
    variables: [
      {
        name: 'DOMAIN',
        label: 'Domain',
        type: 'string',
        required: true,
        description: 'Domain name for N8N interface'
      },
      {
        name: 'N8N_BASIC_AUTH_USER',
        label: 'Username',
        type: 'string',
        required: true,
        description: 'Basic auth username for N8N'
      },
      {
        name: 'N8N_BASIC_AUTH_PASSWORD',
        label: 'Password',
        type: 'string',
        required: true,
        description: 'Basic auth password for N8N'
      }
    ],
    dockerCompose: `version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n_automation
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER={{N8N_BASIC_AUTH_USER}}
      - N8N_BASIC_AUTH_PASSWORD={{N8N_BASIC_AUTH_PASSWORD}}
      - N8N_HOST={{DOMAIN}}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://{{DOMAIN}}/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`{{DOMAIN}}\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
    networks:
      - traefik

volumes:
  n8n_data:

networks:
  traefik:
    external: true`
  }
]

export function getTemplateById(id: string): ServiceTemplate | undefined {
  return serviceTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): ServiceTemplate[] {
  return serviceTemplates.filter(template => template.category === category)
}

export function renderTemplate(template: ServiceTemplate, variables: Record<string, any>): string {
  let rendered = template.dockerCompose
  
  // Replace template variables
  template.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || ''
    const regex = new RegExp(`{{${variable.name}}}`, 'g')
    rendered = rendered.replace(regex, String(value))
  })
  
  return rendered
}
