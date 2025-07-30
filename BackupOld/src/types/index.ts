export interface VPS {
  id: string
  name: string
  ip: string
  port: number
  username: string
  private_key?: string
  password?: string // Para uso temporário (não salvo no banco)
  auth_type: 'key' | 'password'
  tags: string[]
  status: 'online' | 'offline' | 'maintenance'
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export interface VPSStats {
  vpsId: string
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
  }
  uptime: number
  timestamp: Date
}

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: 'running' | 'stopped' | 'paused' | 'restarting'
  ports: string[]
  createdAt: Date
}

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  category: string
  dockerCompose: string
  variables: TemplateVariable[]
  tags: string[]
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select'
  required: boolean
  defaultValue?: string | number | boolean
  options?: string[]
  description?: string
}

export interface InstallationLog {
  id: string
  vpsId: string
  templateId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  logs: string[]
  startedAt: Date
  completedAt?: Date
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'devops' | 'viewer'
  createdAt: Date
  lastLogin?: Date
}

export interface ActionLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  timestamp: Date
}

export interface Alert {
  id: string
  vpsId: string
  type: 'cpu' | 'memory' | 'disk' | 'service' | 'connectivity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  acknowledged: boolean
  createdAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
}
