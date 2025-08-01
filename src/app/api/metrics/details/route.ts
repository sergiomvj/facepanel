import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Generate mock historical data for the last hour
    const now = Date.now()
    const historicalData = Array.from({ length: 60 }, (_, i) => ({
      timestamp: now - (59 - i) * 60000, // Every minute for the last hour
      value: Math.floor(Math.random() * 100)
    }))

    // Mock processes data
    const processes = [
      { pid: 1234, name: 'node', cpu: 15, memory: 256, user: 'root', status: 'running' },
      { pid: 5678, name: 'nginx', cpu: 9, memory: 128, user: 'www-data', status: 'running' },
      { pid: 9012, name: 'postgres', cpu: 12, memory: 512, user: 'postgres', status: 'running' },
      { pid: 3456, name: 'redis', cpu: 5, memory: 64, user: 'redis', status: 'running' },
      { pid: 7890, name: 'docker', cpu: 23, memory: 1024, user: 'root', status: 'running' },
      { pid: 1357, name: 'systemd', cpu: 2, memory: 32, user: 'root', status: 'running' },
      { pid: 2468, name: 'sshd', cpu: 2, memory: 16, user: 'root', status: 'running' },
      { pid: 3579, name: 'cron', cpu: 1, memory: 8, user: 'root', status: 'running' }
    ]

    // Mock network connections
    const connections = [
      { id: '1', local: '0.0.0.0:80', remote: '192.168.1.100:54321', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '2', local: '0.0.0.0:443', remote: '192.168.1.101:12345', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '3', local: '0.0.0.0:22', remote: '192.168.1.102:54322', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '4', local: '0.0.0.0:3306', remote: '192.168.1.103:54323', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '5', local: '0.0.0.0:6379', remote: '192.168.1.104:54324', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '6', local: '0.0.0.0:5432', remote: '192.168.1.105:54325', state: 'ESTABLISHED', protocol: 'TCP' },
      { id: '7', local: '0.0.0.0:8080', remote: '192.168.1.106:54326', state: 'TIME_WAIT', protocol: 'TCP' },
      { id: '8', local: '0.0.0.0:9000', remote: '192.168.1.107:54327', state: 'LISTEN', protocol: 'TCP' }
    ]

    const metrics = {
      cpu: {
        historical: historicalData.map(point => ({ ...point, value: Math.floor(Math.random() * 100) })),
        processes: processes.sort((a, b) => b.cpu - a.cpu),
        details: {
          cores: 8,
          temperature: 45 + Math.floor(Math.random() * 20)
        }
      },
      memory: {
        historical: historicalData.map(point => ({ ...point, value: Math.floor(Math.random() * 100) })),
        processes: processes.sort((a, b) => b.memory - a.memory),
        details: {
          total: 16,
          used: Math.round((Math.random() * 16) * 10) / 10,
          available: Math.round((16 - (Math.random() * 16)) * 10) / 10
        }
      },
      disk: {
        historical: historicalData.map(point => ({ ...point, value: Math.floor(Math.random() * 100) })),
        processes: [
          { pid: 1234, name: '/var/log', cpu: 0, memory: 2048, user: 'root', status: 'active' },
          { pid: 5678, name: '/var/lib/docker', cpu: 0, memory: 8192, user: 'root', status: 'active' },
          { pid: 9012, name: '/opt/app', cpu: 0, memory: 4096, user: 'appuser', status: 'active' }
        ],
        details: {
          total: 500,
          used: Math.round((Math.random() * 500) * 10) / 10,
          available: Math.round((500 - (Math.random() * 500)) * 10) / 10
        }
      },
      network: {
        historical: historicalData.map(point => ({ ...point, value: Math.floor(Math.random() * 50) })),
        connections: connections,
        details: {
          download: Math.round((Math.random() * 50) * 10) / 10,
          upload: Math.round((Math.random() * 20) * 10) / 10
        }
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching detailed metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detailed metrics' },
      { status: 500 }
    )
  }
}