import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente público (para uso no frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente com privilégios administrativos (apenas backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      vps: {
        Row: {
          id: string
          name: string
          ip: string
          port: number
          username: string
          private_key?: string
          password_hash?: string
          auth_type: 'key' | 'password'
          tags: string[]
          status: 'online' | 'offline' | 'maintenance'
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          ip: string
          port?: number
          username: string
          private_key?: string
          password_hash?: string
          auth_type?: 'key' | 'password'
          tags?: string[]
          status?: 'online' | 'offline' | 'maintenance'
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          ip?: string
          port?: number
          username?: string
          private_key?: string
          password_hash?: string
          auth_type?: 'key' | 'password'
          tags?: string[]
          status?: 'online' | 'offline' | 'maintenance'
          last_seen?: string
          updated_at?: string
        }
      }
      vps_stats: {
        Row: {
          id: string
          vps_id: string
          cpu_usage: number
          cpu_cores: number
          memory_used: number
          memory_total: number
          memory_percentage: number
          disk_used: number
          disk_total: number
          disk_percentage: number
          network_bytes_in: number
          network_bytes_out: number
          uptime: number
          timestamp: string
        }
        Insert: {
          id?: string
          vps_id: string
          cpu_usage: number
          cpu_cores: number
          memory_used: number
          memory_total: number
          memory_percentage: number
          disk_used: number
          disk_total: number
          disk_percentage: number
          network_bytes_in: number
          network_bytes_out: number
          uptime: number
          timestamp?: string
        }
        Update: {
          id?: string
          vps_id?: string
          cpu_usage?: number
          cpu_cores?: number
          memory_used?: number
          memory_total?: number
          memory_percentage?: number
          disk_used?: number
          disk_total?: number
          disk_percentage?: number
          network_bytes_in?: number
          network_bytes_out?: number
          uptime?: number
          timestamp?: string
        }
      }
      docker_containers: {
        Row: {
          id: string
          vps_id: string
          container_id: string
          name: string
          image: string
          status: 'running' | 'stopped' | 'paused' | 'restarting'
          ports: string[]
          cpu_percentage: number
          memory_usage: string
          memory_percentage: number
          network_io: string
          block_io: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vps_id: string
          container_id: string
          name: string
          image: string
          status: 'running' | 'stopped' | 'paused' | 'restarting'
          ports?: string[]
          cpu_percentage?: number
          memory_usage?: string
          memory_percentage?: number
          network_io?: string
          block_io?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vps_id?: string
          container_id?: string
          name?: string
          image?: string
          status?: 'running' | 'stopped' | 'paused' | 'restarting'
          ports?: string[]
          cpu_percentage?: number
          memory_usage?: string
          memory_percentage?: number
          network_io?: string
          block_io?: string
          updated_at?: string
        }
      }
      service_templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          docker_compose: string
          variables: any
          tags: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category: string
          docker_compose: string
          variables?: any
          tags?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          docker_compose?: string
          variables?: any
          tags?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      installations: {
        Row: {
          id: string
          vps_id: string
          template_id: string
          service_name: string
          status: 'pending' | 'running' | 'completed' | 'failed'
          variables: any
          logs: string[]
          error_message?: string
          started_at: string
          completed_at?: string
          created_by?: string
        }
        Insert: {
          id?: string
          vps_id: string
          template_id: string
          service_name: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          variables?: any
          logs?: string[]
          error_message?: string
          started_at?: string
          completed_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          vps_id?: string
          template_id?: string
          service_name?: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          variables?: any
          logs?: string[]
          error_message?: string
          completed_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          vps_id: string
          type: 'cpu' | 'memory' | 'disk' | 'service' | 'connectivity'
          severity: 'low' | 'medium' | 'high' | 'critical'
          message: string
          acknowledged: boolean
          acknowledged_by?: string
          acknowledged_at?: string
          created_at: string
          resolved_at?: string
        }
        Insert: {
          id?: string
          vps_id: string
          type: 'cpu' | 'memory' | 'disk' | 'service' | 'connectivity'
          severity: 'low' | 'medium' | 'high' | 'critical'
          message: string
          acknowledged?: boolean
          acknowledged_by?: string
          acknowledged_at?: string
          created_at?: string
          resolved_at?: string
        }
        Update: {
          id?: string
          vps_id?: string
          type?: 'cpu' | 'memory' | 'disk' | 'service' | 'connectivity'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          message?: string
          acknowledged?: boolean
          acknowledged_by?: string
          acknowledged_at?: string
          resolved_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'devops' | 'viewer'
          created_at: string
          last_login?: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'devops' | 'viewer'
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'devops' | 'viewer'
          last_login?: string
        }
      }
      action_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource: string
          resource_id: string
          details: any
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource: string
          resource_id: string
          details?: any
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource?: string
          resource_id?: string
          details?: any
          timestamp?: string
        }
      }
    }
  }
}
