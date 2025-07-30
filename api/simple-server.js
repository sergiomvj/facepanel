const fastify = require('fastify')({ logger: true })

// Enable CORS
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
})

// Enable WebSocket
fastify.register(require('@fastify/websocket'))

// Mock data
let projects = [
  { id: 1, name: 'E-commerce Platform', description: 'Online store with React', status: 'running', type: 'web' },
  { id: 2, name: 'Personal Blog', description: 'Blog with Next.js', status: 'stopped', type: 'web' },
  { id: 3, name: 'REST API', description: 'Node.js API server', status: 'running', type: 'api' }
]

let services = [
  { id: 1, name: 'PostgreSQL', image: 'postgres:15', project: 'ecommerce', type: 'database', port: 5432, status: 'running' },
  { id: 2, name: 'Redis Cache', image: 'redis:7-alpine', project: 'blog', type: 'cache', port: 6379, status: 'running' },
  { id: 3, name: 'Nginx', image: 'nginx:alpine', project: 'api', type: 'web', port: 80, status: 'stopped' }
]

// WebSocket route
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    console.log('WebSocket connection established')
    
    // Send initial metrics
    const sendMetrics = () => {
      const metrics = {
        type: 'metrics',
        data: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: Math.floor(Math.random() * 100),
          network: Math.floor(Math.random() * 10)
        }
      }
      connection.socket.send(JSON.stringify(metrics))
    }
    
    // Send metrics every 2 seconds
    const metricsInterval = setInterval(sendMetrics, 2000)
    
    // Send initial logs
    const sendLogs = () => {
      const logs = [
        { level: 'info', message: 'System started successfully', timestamp: new Date().toISOString(), source: 'system' },
        { level: 'warn', message: 'High memory usage detected', timestamp: new Date().toISOString(), source: 'monitoring' },
        { level: 'error', message: 'Connection timeout', timestamp: new Date().toISOString(), source: 'database' }
      ]
      connection.socket.send(JSON.stringify({ type: 'logs', data: logs }))
    }
    
    sendLogs()
    
    connection.socket.on('close', () => {
      clearInterval(metricsInterval)
      console.log('WebSocket connection closed')
    })
  })
})

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Projects routes
fastify.get('/api/projects', async (request, reply) => {
  return { success: true, data: projects }
})

fastify.post('/api/projects', async (request, reply) => {
  const { name, description, type } = request.body
  const newProject = {
    id: projects.length + 1,
    name,
    description,
    type,
    status: 'creating',
    created_at: new Date().toISOString()
  }
  projects.push(newProject)
  
  // Simulate async creation
  setTimeout(() => {
    newProject.status = 'running'
  }, 2000)
  
  return { success: true, data: newProject }
})

fastify.post('/api/projects/:id/start', async (request, reply) => {
  const { id } = request.params
  const project = projects.find(p => p.id == id)
  if (project) {
    project.status = 'running'
    return { success: true, data: project }
  }
  return { success: false, error: 'Project not found' }
})

fastify.post('/api/projects/:id/stop', async (request, reply) => {
  const { id } = request.params
  const project = projects.find(p => p.id == id)
  if (project) {
    project.status = 'stopped'
    return { success: true, data: project }
  }
  return { success: false, error: 'Project not found' }
})

fastify.post('/api/projects/:id/restart', async (request, reply) => {
  const { id } = request.params
  const project = projects.find(p => p.id == id)
  if (project) {
    project.status = 'restarting'
    setTimeout(() => {
      project.status = 'running'
    }, 1000)
    return { success: true, data: project }
  }
  return { success: false, error: 'Project not found' }
})

// Services routes
fastify.get('/api/services', async (request, reply) => {
  return { success: true, data: services }
})

fastify.post('/api/services', async (request, reply) => {
  const { name, image, project, type, port, env, isTemplate } = request.body
  const newService = {
    id: services.length + 1,
    name,
    image,
    project,
    type,
    port,
    env,
    isTemplate,
    status: 'creating',
    created_at: new Date().toISOString()
  }
  services.push(newService)
  
  // Simulate async creation
  setTimeout(() => {
    newService.status = 'running'
  }, 2000)
  
  return { success: true, data: newService }
})

fastify.post('/api/services/:id/start', async (request, reply) => {
  const { id } = request.params
  const service = services.find(s => s.id == id)
  if (service) {
    service.status = 'running'
    return { success: true, data: service }
  }
  return { success: false, error: 'Service not found' }
})

fastify.post('/api/services/:id/stop', async (request, reply) => {
  const { id } = request.params
  const service = services.find(s => s.id == id)
  if (service) {
    service.status = 'stopped'
    return { success: true, data: service }
  }
  return { success: false, error: 'Service not found' }
})

fastify.post('/api/services/:id/restart', async (request, reply) => {
  const { id } = request.params
  const service = services.find(s => s.id == id)
  if (service) {
    service.status = 'restarting'
    setTimeout(() => {
      service.status = 'running'
    }, 1000)
    return { success: true, data: service }
  }
  return { success: false, error: 'Service not found' }
})

// Metrics routes
fastify.get('/api/metrics', async (request, reply) => {
  return {
    success: true,
    data: {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 10),
      timestamp: new Date().toISOString()
    }
  }
})

// Files routes
fastify.get('/api/files', async (request, reply) => {
  return { success: true, data: [] }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 Backend server running on http://localhost:3000')
    console.log('📊 WebSocket available at ws://localhost:3000/ws')
    console.log('🔍 Health check: http://localhost:3000/api/health')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
