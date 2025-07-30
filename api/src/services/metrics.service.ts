import { dockerService } from './docker.service'
import { supabase } from '../config/supabase'
import os from 'os'

class MetricsService {
  async getSystemMetrics() {
    const cpuUsage = os.loadavg()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    
    return {
      cpu: {
        usage: cpuUsage[0],
        cores: os.cpus().length
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percentage: (usedMemory / totalMemory) * 100
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch()
    }
  }

  async getServiceMetrics(serviceId: string, userId: string) {
    try {
      const stats = await dockerService.getContainerStats(serviceId, userId)
      
      // Processar estatísticas do Docker
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
      const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

      const memoryUsage = stats.memory_stats.usage || 0
      const memoryLimit = stats.memory_stats.limit || 0
      const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0

      return {
        cpu: {
          percentage: cpuPercent || 0
        },
        memory: {
          usage: memoryUsage,
          limit: memoryLimit,
          percentage: memoryPercent
        },
        network: stats.networks || {},
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Failed to get service metrics: ${(error as Error).message}`)
    }
  }

  async getProjectMetrics(projectId: string, userId: string) {
    // Verificar se o projeto pertence ao usuário
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found or access denied')
    }

    // Buscar todos os serviços do projeto
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, status')
      .eq('project_id', projectId)

    if (servicesError) {
      throw new Error('Failed to fetch project services')
    }

    const serviceMetrics = []
    let totalCpuUsage = 0
    let totalMemoryUsage = 0
    let runningServices = 0

    for (const service of services || []) {
      if (service.status === 'running') {
        try {
          const metrics = await this.getServiceMetrics(service.id, userId)
          serviceMetrics.push({
            serviceId: service.id,
            serviceName: service.name,
            ...metrics
          })
          totalCpuUsage += metrics.cpu.percentage
          totalMemoryUsage += metrics.memory.usage
          runningServices++
        } catch (error) {
          // Serviço pode estar parado ou com erro
          serviceMetrics.push({
            serviceId: service.id,
            serviceName: service.name,
            status: 'error',
            error: (error as Error).message
          })
        }
      }
    }

    return {
      projectId,
      totalServices: services?.length || 0,
      runningServices,
      stoppedServices: (services?.length || 0) - runningServices,
      aggregatedMetrics: {
        totalCpuUsage,
        averageCpuUsage: runningServices > 0 ? totalCpuUsage / runningServices : 0,
        totalMemoryUsage
      },
      serviceMetrics,
      timestamp: new Date().toISOString()
    }
  }
}

export const metricsService = new MetricsService()
