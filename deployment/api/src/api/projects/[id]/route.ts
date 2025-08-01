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
    cpu: 2.1,
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
    cpu: 1.8,
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = projects.find(p => p.id === params.id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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
    const { name, description, domain, environment, status } = body

    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const updatedProject = {
      ...projects[projectIndex],
      name: name || projects[projectIndex].name,
      description: description || projects[projectIndex].description,
      domain: domain || projects[projectIndex].domain,
      environment: environment || projects[projectIndex].environment,
      status: status || projects[projectIndex].status,
      updatedAt: new Date().toISOString()
    }

    projects[projectIndex] = updatedProject

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const deletedProject = projects[projectIndex]
    projects.splice(projectIndex, 1)

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}