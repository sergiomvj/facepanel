import { NextResponse } from 'next/server'

// Generate mock historical data
function generateHistoricalData(baseValue: number, count: number = 30) {
  const data = []
  const now = Date.now()
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 60000).toLocaleTimeString() // Every minute
    const variation = (Math.random() - 0.5) * 20 // ±10% variation
    const value = Math.max(0, Math.min(100, baseValue + variation))
    data.push({ time, value: Math.round(value) })
  }
  
  return data
}

// Generate mock processes
function generateProcesses(count: number = 20) {
  const processNames = [
    'node', 'nginx', 'mysql', 'postgres', 'redis', 'mongodb', 'docker', 'systemd',
    'bash', 'python', 'java', 'chrome', 'firefox', 'code', 'vscode', 'git'
  ]
  const users = ['root', 'www-data', 'mysql', 'postgres', 'ubuntu', 'user']
  const statuses = ['running', 'sleeping', 'stopped', 'zombie']
  
  return Array.from({ length: count }, (_, i) => ({
    pid: 1000 + i,
    name: processNames[Math.floor(Math.random() * processNames.length)],
    cpu: Math.round(Math.random() * 25),
    memory: Math.round(Math.random() * 15),
    user: users[Math.floor(Math.random() * users.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }))
}

// Generate mock network connections
function generateConnections(count: number = 15) {
  const protocols = ['TCP', 'UDP', 'TCP6', 'UDP6']
  const states = ['ESTABLISHED', 'LISTEN', 'TIME_WAIT', 'CLOSE_WAIT']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `conn-${i}`,
    local: `192.168.1.100:${8000 + i}`,
    remote: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${Math.floor(Math.random() * 65535)}`,
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    state: states[Math.floor(Math.random() * states.length)],
    bytesSent: Math.random() * 1000000,
    bytesReceived: Math.random() * 2000000
  }))
}

export async function GET() {
  try {
    const baseCpu = Math.floor(Math.random() * 100)
    const baseMemory = Math.floor(Math.random() * 100)
    const baseDisk = Math.floor(Math.random() * 100)
    const baseNetwork = Math.floor(Math.random() * 50)

    const metrics = {
      cpu: {
        usage: baseCpu,
        cores: 8,
        temperature: 45 + Math.floor(Math.random() * 20)
      },
      memory: {
        usage: baseMemory,
        total: 16,
        used: Math.round((baseMemory / 100) * 16),
        available: Math.round(16 - (baseMemory / 100) * 16)
      },
      disk: {
        usage: baseDisk,
        total: 500,
        used: Math.round((baseDisk / 100) * 500),
        free: Math.round(500 - (baseDisk / 100) * 500)
      },
      network: {
        download: Math.round(Math.random() * 50),
        upload: Math.round(Math.random() * 20),
        totalDownload: 1024 + Math.floor(Math.random() * 5000),
        totalUpload: 256 + Math.floor(Math.random() * 2000)
      },
      system: {
        uptime: Math.floor(Math.random() * 86400 * 30), // 30 days max
        loadAverage: [
          Math.round((Math.random() * 4) * 100) / 100,
          Math.round((Math.random() * 4) * 100) / 100,
          Math.round((Math.random() * 4) * 100) / 100
        ],
        processes: Math.floor(Math.random() * 500) + 100
      },
      // Historical data for charts
      historical: {
        cpu: generateHistoricalData(baseCpu),
        memory: generateHistoricalData(baseMemory),
        disk: generateHistoricalData(baseDisk),
        network: generateHistoricalData(baseNetwork)
      },
      // Detailed information
      details: {
        processes: generateProcesses(),
        connections: generateConnections(),
        diskUsage: [
          { name: '/dev/sda1', used: 150 * 1024, total: 250 * 1024, percentage: 60 },
          { name: '/dev/sda2', used: 80 * 1024, total: 100 * 1024, percentage: 80 },
          { name: '/dev/sdb1', used: 200 * 1024, total: 250 * 1024, percentage: 80 }
        ],
        networkInterfaces: [
          { name: 'eth0', download: baseNetwork * 0.8, upload: baseNetwork * 0.3 },
          { name: 'wlan0', download: baseNetwork * 0.2, upload: baseNetwork * 0.7 },
          { name: 'lo', download: 0.1, upload: 0.1 }
        ]
      },
      timestamp: Date.now()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}