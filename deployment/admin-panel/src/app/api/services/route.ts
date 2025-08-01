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

export async function GET() {
  try {
    return NextResponse.json({
      services,
      blueprints,
      total: services.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
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
      projectId,
      healthCheck
    } = body

    if (!name || !image) {
      return NextResponse.json(
        { error: 'Service name and image are required' },
        { status: 400 }
      )
    }

    const newService = {
      id: Date.now().toString(),
      name,
      description: description || '',
      image,
      status: 'creating',
      ports: ports || [],
      environment: environment || [],
      volumes: volumes || [],
      networks: networks || ['default'],
      cpu: 0,
      memory: 0,
      restartPolicy: restartPolicy || 'unless-stopped',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: projectId || null,
      healthCheck: healthCheck || {
        enabled: false,
        interval: 30,
        timeout: 10,
        retries: 3,
        test: []
      }
    }

    services.push(newService)

    // Simulate service creation process
    setTimeout(() => {
      const serviceIndex = services.findIndex(s => s.id === newService.id)
      if (serviceIndex !== -1) {
        services[serviceIndex] = {
          ...services[serviceIndex],
          status: 'running',
          cpu: Math.random() * 20,
          memory: Math.random() * 1024
        }
      }
    }, 3000)

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}