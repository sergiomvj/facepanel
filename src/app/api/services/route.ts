import { NextResponse } from 'next/server'
import { dockerService, ContainerInfo } from '@/lib/docker'

// Service blueprints/templates
const blueprints = [
  {
    id: 'nginx',
    name: 'Nginx Web Server',
    description: 'High-performance web server and reverse proxy',
    image: 'nginx:latest',
    category: 'web',
    ports: ['80:80'],
    environment: [
      { name: 'NGINX_HOST', default: 'example.com', description: 'Server hostname' },
      { name: 'NGINX_PORT', default: '80', description: 'Server port' }
    ],
    volumes: [
      { path: '/var/www/html', description: 'Website files directory' }
    ],
    networks: ['web'],
    healthCheck: {
      enabled: true,
      test: ['CMD', 'curl', '-f', 'http://localhost/']
    }
  },
  {
    id: 'nodejs',
    name: 'Node.js Application',
    description: 'Node.js application server',
    image: 'node:18-alpine',
    category: 'application',
    ports: ['3000:3000'],
    environment: [
      { name: 'NODE_ENV', default: 'production', description: 'Node environment' },
      { name: 'PORT', default: '3000', description: 'Application port' }
    ],
    volumes: [
      { path: '/app', description: 'Application code directory' }
    ],
    networks: ['app'],
    healthCheck: {
      enabled: true,
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/health']
    }
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    description: 'Relational database management system',
    image: 'postgres:15',
    category: 'database',
    ports: ['5432:5432'],
    environment: [
      { name: 'POSTGRES_DB', default: 'myapp', description: 'Database name' },
      { name: 'POSTGRES_USER', default: 'user', description: 'Database user' },
      { name: 'POSTGRES_PASSWORD', default: 'password', description: 'Database password' }
    ],
    volumes: [
      { path: '/var/lib/postgresql/data', description: 'Database data directory' }
    ],
    networks: ['db'],
    healthCheck: {
      enabled: true,
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
    }
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    description: 'In-memory data structure store',
    image: 'redis:7-alpine',
    category: 'cache',
    ports: ['6379:6379'],
    environment: [],
    volumes: [
      { path: '/data', description: 'Redis data directory' }
    ],
    networks: ['cache'],
    healthCheck: {
      enabled: false,
      test: []
    }
  },
  {
    id: 'mysql',
    name: 'MySQL Database',
    description: 'Popular relational database',
    image: 'mysql:8.0',
    category: 'database',
    ports: ['3306:3306'],
    environment: [
      { name: 'MYSQL_DATABASE', default: 'myapp', description: 'Database name' },
      { name: 'MYSQL_USER', default: 'user', description: 'Database user' },
      { name: 'MYSQL_PASSWORD', default: 'password', description: 'Database password' },
      { name: 'MYSQL_ROOT_PASSWORD', default: 'rootpassword', description: 'Root password' }
    ],
    volumes: [
      { path: '/var/lib/mysql', description: 'MySQL data directory' }
    ],
    networks: ['db'],
    healthCheck: {
      enabled: true,
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'NoSQL document database',
    image: 'mongo:6',
    category: 'database',
    ports: ['27017:27017'],
    environment: [
      { name: 'MONGO_INITDB_ROOT_USERNAME', default: 'root', description: 'Root username' },
      { name: 'MONGO_INITDB_ROOT_PASSWORD', default: 'password', description: 'Root password' }
    ],
    volumes: [
      { path: '/data/db', description: 'MongoDB data directory' }
    ],
    networks: ['db'],
    healthCheck: {
      enabled: true,
      test: ['CMD', 'mongosh', '--eval', 'db.adminCommand("ping")']
    }
  }
]

// Convert Docker container to service format
function containerToService(container: ContainerInfo): any {
  const portMapping = container.ports.map(port => {
    if (port.PublicPort) {
      return `${port.PublicPort}:${port.PrivatePort}`
    }
    return `${port.PrivatePort}:${port.PrivatePort}`
  })

  return {
    id: container.id,
    name: container.name,
    description: `Docker container: ${container.image}`,
    image: container.image,
    status: container.state === 'running' ? 'running' : 'stopped',
    ports: portMapping,
    environment: [], // Will be populated from container inspect
    volumes: [], // Will be populated from container inspect
    networks: [], // Will be populated from container inspect
    cpu: 0, // Will be populated from stats
    memory: 0, // Will be populated from stats
    restartPolicy: 'unless-stopped', // Default, will be updated from inspect
    createdAt: container.created.toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: null,
    healthCheck: {
      enabled: false,
      interval: 30,
      timeout: 10,
      retries: 3,
      test: []
    },
    containerId: container.id,
    isDockerContainer: true
  }
}

export async function GET() {
  try {
    // Get real containers from Docker
    const containers = await dockerService.getAllContainers()
    
    // Convert containers to service format
    const services = await Promise.all(
      containers.map(async (container) => {
        const service = containerToService(container)
        
        try {
          // Get additional container details
          const details = await dockerService.getContainer(container.id)
          
          // Populate environment variables
          service.environment = Object.entries(details.Config.Env || {})
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}=${value}`)
          
          // Populate volumes
          service.volumes = Object.entries(details.Mounts || {})
            .map(([_, mount]: any) => `${mount.Source}:${mount.Destination}`)
          
          // Populate networks
          service.networks = Object.keys(details.NetworkSettings.Networks || {})
          
          // Get restart policy
          service.restartPolicy = details.HostConfig.RestartPolicy?.Name || 'unless-stopped'
          
          // Get stats if container is running
          if (container.state === 'running') {
            try {
              const stats = await dockerService.getContainerStats(container.id)
              service.cpu = Math.round((stats.cpu_stats.cpu_usage.total_usage / stats.cpu_stats.system_cpu_usage) * 100)
              service.memory = Math.round(stats.memory_stats.usage / 1024 / 1024) // MB
            } catch (statsError) {
              console.warn('Failed to get stats for container:', container.name, statsError)
            }
          }
        } catch (error) {
          console.warn('Failed to get details for container:', container.name, error)
        }
        
        return service
      })
    )

    return NextResponse.json({
      services,
      blueprints,
      total: services.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      image, 
      ports, 
      environment, 
      volumes, 
      networks, 
      restartPolicy,
      healthCheck
    } = body

    if (!name || !image) {
      return NextResponse.json(
        { error: 'Service name and image are required' },
        { status: 400 }
      )
    }

    // Prepare Docker container configuration
    const containerConfig: any = {
      Image: image,
      name: name,
      Env: environment ? environment.map((env: string) => env) : [],
      HostConfig: {
        RestartPolicy: {
          Name: restartPolicy || 'unless-stopped'
        }
      }
    }

    // Add port bindings
    if (ports && ports.length > 0) {
      const portBindings: any = {}
      const exposedPorts: any = {}
      
      ports.forEach((portMapping: string) => {
        const [hostPort, containerPort] = portMapping.split(':')
        const key = `${containerPort}/tcp`
        
        exposedPorts[key] = {}
        portBindings[key] = [{ HostPort: hostPort }]
      })
      
      containerConfig.ExposedPorts = exposedPorts
      containerConfig.HostConfig.PortBindings = portBindings
    }

    // Add volume bindings
    if (volumes && volumes.length > 0) {
      const binds: string[] = []
      
      volumes.forEach((volumeMapping: string) => {
        binds.push(volumeMapping)
      })
      
      containerConfig.HostConfig.Binds = binds
    }

    // Add networking
    if (networks && networks.length > 0) {
      containerConfig.NetworkingConfig = {
        EndpointsConfig: {}
      }
      
      networks.forEach((network: string) => {
        containerConfig.NetworkingConfig.EndpointsConfig[network] = {}
      })
    }

    // Add health check
    if (healthCheck && healthCheck.enabled) {
      containerConfig.Healthcheck = {
        Test: healthCheck.test,
        Interval: healthCheck.interval * 1000000000, // Convert to nanoseconds
        Timeout: healthCheck.timeout * 1000000000,
        Retries: healthCheck.retries
      }
    }

    // Create container
    const containerId = await dockerService.createContainer(containerConfig)
    
    // Start the container
    await dockerService.startContainer(containerId)

    // Get the created container details
    const containers = await dockerService.getAllContainers()
    const createdContainer = containers.find(c => c.id === containerId)
    
    if (!createdContainer) {
      throw new Error('Failed to retrieve created container')
    }

    const service = containerToService(createdContainer)
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service', details: error.message },
      { status: 500 }
    )
  }
}