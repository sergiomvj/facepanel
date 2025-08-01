import { NextResponse } from 'next/server'

// Mock projects data - in a real implementation, this would come from a database
let projects = [
  {
    id: '1',
    name: 'Next.js Blog',
    description: 'Personal blog built with Next.js and Tailwind CSS',
    status: 'running',
    path: '/projects/nextjs-blog',
    services: 3,
    cpu: 2,
    memory: 512,
    disk: 156,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    domain: 'blog.example.com',
    environment: 'production'
  },
  {
    id: '2',
    name: 'E-commerce API',
    description: 'RESTful API for e-commerce platform',
    status: 'running',
    path: '/projects/ecommerce-api',
    services: 2,
    cpu: 2,
    memory: 256,
    disk: 89,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    domain: 'api.example.com',
    environment: 'production'
  },
  {
    id: '3',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard with charts',
    status: 'stopped',
    path: '/projects/analytics-dashboard',
    services: 4,
    cpu: 0,
    memory: 0,
    disk: 234,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
    domain: 'analytics.example.com',
    environment: 'staging'
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      projects,
      total: projects.length
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, domain, environment } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || '',
      status: 'creating',
      path: `/projects/${name.toLowerCase().replace(/\s+/g, '-')}`,
      services: 0,
      cpu: 0,
      memory: 0,
      disk: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      domain: domain || '',
      environment: environment || 'development'
    }

    projects.push(newProject)

    // Simulate project creation process
    setTimeout(() => {
      const projectIndex = projects.findIndex(p => p.id === newProject.id)
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          status: 'running',
          services: 1,
          cpu: 1,
          memory: 128,
          disk: 50
        }
      }
    }, 3000)

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}