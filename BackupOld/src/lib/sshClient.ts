import { NodeSSH } from 'node-ssh'
import { VPS } from '@/types'

export class SSHClient {
  private ssh: NodeSSH

  constructor() {
    this.ssh = new NodeSSH()
  }

  async connect(vps: VPS): Promise<boolean> {
    try {
      const connectionConfig: any = {
        host: vps.ip,
        port: vps.port || 22,
        username: vps.username,
      }

      // Configurar autenticação baseada no tipo
      if (vps.auth_type === 'password' && vps.password) {
        connectionConfig.password = vps.password
      } else if (vps.private_key) {
        connectionConfig.privateKey = vps.private_key
      } else {
        throw new Error('Nenhuma credencial de autenticação fornecida')
      }

      await this.ssh.connect(connectionConfig)
      return true
    } catch (error) {
      console.error('SSH connection failed:', error)
      return false
    }
  }

  async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
      const result = await this.ssh.execCommand(command)
      return {
        stdout: result.stdout,
        stderr: result.stderr
      }
    } catch (error) {
      throw new Error(`Command execution failed: ${error}`)
    }
  }

  async getSystemStats() {
    const commands = {
      cpu: "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//'",
      memory: "free -m | awk 'NR==2{printf \"%.1f %.1f %.1f\", $3*100/$2, $3, $2}'",
      disk: "df -h / | awk 'NR==2{print $5 \" \" $3 \" \" $2}' | sed 's/%//'",
      uptime: "uptime -s"
    }

    const results: Record<string, string> = {}
    
    for (const [key, command] of Object.entries(commands)) {
      try {
        const result = await this.executeCommand(command)
        results[key] = result.stdout.trim()
      } catch (error) {
        console.error(`Failed to execute ${key} command:`, error)
        results[key] = ''
      }
    }

    return this.parseSystemStats(results)
  }

  private parseSystemStats(results: Record<string, string>) {
    // Parse CPU usage
    const cpuUsage = parseFloat(results.cpu) || 0

    // Parse memory usage
    const memoryParts = results.memory.split(' ')
    const memoryPercentage = parseFloat(memoryParts[0]) || 0
    const memoryUsed = parseFloat(memoryParts[1]) || 0
    const memoryTotal = parseFloat(memoryParts[2]) || 0

    // Parse disk usage
    const diskParts = results.disk.split(' ')
    const diskPercentage = parseFloat(diskParts[0]) || 0
    const diskUsed = diskParts[1] || '0G'
    const diskTotal = diskParts[2] || '0G'

    // Parse uptime
    const uptimeStr = results.uptime
    const uptime = uptimeStr ? new Date(uptimeStr).getTime() : 0

    return {
      cpu: {
        usage: cpuUsage,
        cores: 1 // This would need a separate command to get actual core count
      },
      memory: {
        used: memoryUsed,
        total: memoryTotal,
        percentage: memoryPercentage
      },
      disk: {
        used: this.parseSize(diskUsed),
        total: this.parseSize(diskTotal),
        percentage: diskPercentage
      },
      uptime: Date.now() - uptime,
      timestamp: new Date()
    }
  }

  private parseSize(sizeStr: string): number {
    const size = parseFloat(sizeStr)
    const unit = sizeStr.slice(-1).toUpperCase()
    
    switch (unit) {
      case 'K': return size * 1024
      case 'M': return size * 1024 * 1024
      case 'G': return size * 1024 * 1024 * 1024
      case 'T': return size * 1024 * 1024 * 1024 * 1024
      default: return size
    }
  }

  async getDockerContainers() {
    const command = "docker ps -a --format 'table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.CreatedAt}}'"
    
    try {
      const result = await this.executeCommand(command)
      return this.parseDockerOutput(result.stdout)
    } catch (error) {
      console.error('Failed to get Docker containers:', error)
      return []
    }
  }

  async getContainerStats() {
    const command = "docker stats --no-stream --format 'table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\\t{{.NetIO}}\\t{{.BlockIO}}'"
    
    try {
      const result = await this.executeCommand(command)
      return this.parseContainerStats(result.stdout)
    } catch (error) {
      console.error('Failed to get container stats:', error)
      return []
    }
  }

  private parseContainerStats(output: string) {
    const lines = output.split('\\n').slice(1) // Skip header
    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\\t')
        return {
          container: parts[0] || '',
          cpuPerc: this.parsePercentage(parts[1] || '0%'),
          memUsage: parts[2] || '0B / 0B',
          memPerc: this.parsePercentage(parts[3] || '0%'),
          netIO: parts[4] || '0B / 0B',
          blockIO: parts[5] || '0B / 0B'
        }
      })
  }

  private parsePercentage(percent: string): number {
    return parseFloat(percent.replace('%', '')) || 0
  }

  private parseDockerOutput(output: string) {
    const lines = output.split('\\n').slice(1) // Skip header
    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\\t')
        return {
          id: parts[0] || '',
          name: parts[1] || '',
          image: parts[2] || '',
          status: this.parseDockerStatus(parts[3] || ''),
          ports: this.parseDockerPorts(parts[4] || ''),
          createdAt: new Date(parts[5] || '')
        }
      })
  }

  private parseDockerStatus(status: string): 'running' | 'stopped' | 'paused' | 'restarting' {
    if (status.includes('Up')) return 'running'
    if (status.includes('Exited')) return 'stopped'
    if (status.includes('Paused')) return 'paused'
    if (status.includes('Restarting')) return 'restarting'
    return 'stopped'
  }

  private parseDockerPorts(ports: string): string[] {
    return ports ? ports.split(',').map(p => p.trim()) : []
  }

  async deployService(dockerCompose: string, serviceName: string) {
    // Create service directory
    await this.executeCommand(`mkdir -p /opt/facepanel-services/${serviceName}`)
    
    // Upload docker-compose file
    const composeFile = `/opt/facepanel-services/${serviceName}/docker-compose.yml`
    await this.ssh.putFile(Buffer.from(dockerCompose), composeFile)
    
    // Deploy service
    const deployCommand = `cd /opt/facepanel-services/${serviceName} && docker-compose up -d`
    return await this.executeCommand(deployCommand)
  }

  async controlContainer(containerId: string, action: 'start' | 'stop' | 'restart') {
    const command = `docker ${action} ${containerId}`
    return await this.executeCommand(command)
  }

  async getContainerLogs(containerId: string, lines: number = 100) {
    const command = `docker logs --tail ${lines} ${containerId}`
    return await this.executeCommand(command)
  }

  disconnect() {
    this.ssh.dispose()
  }
}
