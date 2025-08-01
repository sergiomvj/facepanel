import { NextResponse } from 'next/server'

// Mock services data - in a real implementation, this would come from Docker API
let services = [
  {
    id: '1',
    name: 'web-server',
    description: 'Nginx web server',
    image: 'nginx:latest',
    status: 'running',
    ports: ['80:80', '443:443'],
    environment: ['NGINX_HOST=example.com', 'NGINX_PORT=80'],
    volumes: ['/var/www/html:/usr/share/nginx/html'],
    networks: ['web-network'],
    cpu: 2.5,
    memory: 128,
    restartPolicy: 'unless-stopped',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    projectId: '1',
    healthCheck: {
      enabled: true,
      interval: 30,
      timeout: 10,
      retries: 3,
      test: ['CMD', 'curl', '-f', 'http://localhost/']
    }
  },
  {
    id: '2',
    name: 'api-server',
    description: 'Node.js API server',
    image: 'node:18-alpine',
    status: 'running',
    ports: ['3000:3000'],
    environment: ['NODE_ENV=production', 'PORT=3000'],
    volumes: ['/app:/app'],
    networks: ['api-network'],
    cpu: 15.2,
    memory: 512,
    restartPolicy: 'unless-stopped',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    projectId: '2',
    healthCheck: {
      enabled: true,
      interval: 30,
      timeout: 10,
      retries: 3,
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/health']
    }
  },
  {
    id: '3',
    name: 'database',
    description: 'PostgreSQL database',
    image: 'postgres:15',
    status: 'running',
    ports: ['5432:5432'],
    environment: [
      'POSTGRES_DB=myapp',
      'POSTGRES_USER=user',
      'POSTGRES_PASSWORD=pass'
    ],
    volumes: ['/var/lib/postgresql/data:/var/lib/postgresql/data'],
    networks: ['db-network'],
    cpu: 8.7,
    memory: 1024,
    restartPolicy: 'unless-stopped',
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
    projectId: '1',
    healthCheck: {
      enabled: true,
      interval: 30,
      timeout: 10,
      retries: 3,
      test: ['CMD-SHELL', 'pg_isready -U user']
    }
  },
  {
    id: '4',
    name: 'redis-cache',
    description: 'Redis cache server',
    image: 'redis:7-alpine',
    status: 'stopped',
    ports: ['6379:6379'],
    environment: [],
    volumes: ['/data:/data'],
    networks: ['cache-network'],
    cpu: 0,
    memory: 0,
    restartPolicy: 'unless-stopped',
    createdAt: '2024-01-08T12:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    projectId: '2',
    healthCheck: {
      enabled: false,
      interval: 0,
      timeout: 0,
      retries: 0,
      test: []
    }
  }
]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = services.find(s => s.id === params.id)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      status,
      healthCheck
    } = body

    const serviceIndex = services.findIndex(s => s.id === params.id)
    
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const updatedService = {
      ...services[serviceIndex],
      name: name || services[serviceIndex].name,
      description: description || services[serviceIndex].description,
      image: image || services[serviceIndex].image,
      ports: ports || services[serviceIndex].ports,
      environment: environment || services[serviceIndex].environment,
      volumes: volumes || services[serviceIndex].volumes,
      networks: networks || services[serviceIndex].networks,
      restartPolicy: restartPolicy || services[serviceIndex].restartPolicy,
      status: status || services[serviceIndex].status,
      healthCheck: healthCheck || services[serviceIndex].healthCheck,
      updatedAt: new Date().toISOString()
    }

    services[serviceIndex] = updatedService

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceIndex = services.findIndex(s => s.id === params.id)
    
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const deletedService = services[serviceIndex]
    services.splice(serviceIndex, 1)

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}

// Action endpoints
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    const serviceIndex = services.findIndex(s => s.id === params.id)
    
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    let newStatus = services[serviceIndex].status

    switch (action) {
      case 'start':
        newStatus = 'running'
        // Simulate service starting
        setTimeout(() => {
          const index = services.findIndex(s => s.id === params.id)
          if (index !== -1) {
            services[index] = {
              ...services[index],
              status: 'running',
              cpu: Math.random() * 20,
              memory: Math.random() * 1024
            }
          }
        }, 2000)
        break
      case 'stop':
        newStatus = 'stopped'
        services[serviceIndex] = {
          ...services[serviceIndex],
          status: 'stopped',
          cpu: 0,
          memory: 0
        }
        break
      case 'restart':
        newStatus = 'restarting'
        // Simulate restart process
        setTimeout(() => {
          const index = services.findIndex(s => s.id === params.id)
          if (index !== -1) {
            services[index] = {
              ...services[index],
              status: 'running',
              cpu: Math.random() * 20,
              memory: Math.random() * 1024
            }
          }
        }, 3000)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    services[serviceIndex] = {
      ...services[serviceIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      message: `Service ${action} initiated successfully`,
      status: newStatus 
    })
  } catch (error) {
    console.error('Error performing service action:', error)
    return NextResponse.json(
      { error: 'Failed to perform service action' },
      { status: 500 }
    )
  }
}