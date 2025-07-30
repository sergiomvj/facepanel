import Docker from 'dockerode'
import { supabase } from '../config/supabase'

class DockerService {
  private docker: Docker

  constructor() {
    this.docker = new Docker()
  }

  async startContainer(serviceId: string, userId: string) {
    // Verificar se o serviço pertence ao usuário
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', serviceId)
      .eq('projects.user_id', userId)
      .single()

    if (error || !service) {
      throw new Error('Service not found or access denied')
    }

    try {
      // Criar container se não existir
      let container
      try {
        container = this.docker.getContainer(serviceId)
        await container.inspect()
      } catch {
        // Container não existe, criar novo
        container = await this.docker.createContainer({
          Image: service.image,
          name: serviceId,
          ExposedPorts: this.parseExposedPorts(service.ports),
          HostConfig: {
            PortBindings: this.parsePortBindings(service.ports)
          },
          Env: this.parseEnvironment(service.environment)
        })
      }

      await container.start()

      // Atualizar status no banco
      await supabase
        .from('services')
        .update({ status: 'running' })
        .eq('id', serviceId)

      return { message: 'Container started successfully', serviceId }
    } catch (error) {
      throw new Error(`Failed to start container: ${(error as Error).message}`)
    }
  }

  async stopContainer(serviceId: string, userId: string) {
    // Verificar se o serviço pertence ao usuário
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', serviceId)
      .eq('projects.user_id', userId)
      .single()

    if (error || !service) {
      throw new Error('Service not found or access denied')
    }

    try {
      const container = this.docker.getContainer(serviceId)
      await container.stop()

      // Atualizar status no banco
      await supabase
        .from('services')
        .update({ status: 'stopped' })
        .eq('id', serviceId)

      return { message: 'Container stopped successfully', serviceId }
    } catch (error) {
      throw new Error(`Failed to stop container: ${(error as Error).message}`)
    }
  }

  async getContainerLogs(serviceId: string, userId: string) {
    // Verificar se o serviço pertence ao usuário
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', serviceId)
      .eq('projects.user_id', userId)
      .single()

    if (error || !service) {
      throw new Error('Service not found or access denied')
    }

    try {
      const container = this.docker.getContainer(serviceId)
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100
      })

      return logs.toString()
    } catch (error) {
      throw new Error(`Failed to get container logs: ${(error as Error).message}`)
    }
  }

  async getContainerStats(serviceId: string, userId: string) {
    // Verificar se o serviço pertence ao usuário
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', serviceId)
      .eq('projects.user_id', userId)
      .single()

    if (error || !service) {
      throw new Error('Service not found or access denied')
    }

    try {
      const container = this.docker.getContainer(serviceId)
      const stats = await container.stats({ stream: false })
      return stats
    } catch (error) {
      throw new Error(`Failed to get container stats: ${(error as Error).message}`)
    }
  }

  private parseExposedPorts(ports: any): Record<string, {}> {
    if (!ports || !Array.isArray(ports)) return {}
    
    const exposedPorts: Record<string, {}> = {}
    ports.forEach((port: any) => {
      exposedPorts[`${port.container}/tcp`] = {}
    })
    return exposedPorts
  }

  private parsePortBindings(ports: any): Record<string, Array<{ HostPort: string }>> {
    if (!ports || !Array.isArray(ports)) return {}
    
    const portBindings: Record<string, Array<{ HostPort: string }>> = {}
    ports.forEach((port: any) => {
      portBindings[`${port.container}/tcp`] = [{ HostPort: port.host.toString() }]
    })
    return portBindings
  }

  private parseEnvironment(environment: any): string[] {
    if (!environment || typeof environment !== 'object') return []
    
    return Object.entries(environment).map(([key, value]) => `${key}=${value}`)
  }
}

export const dockerService = new DockerService()
