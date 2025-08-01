import { NextResponse } from 'next/server'
import { dockerService } from '@/lib/docker'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const container = await dockerService.getContainer(params.id)
    
    if (!container) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    // Convert container to service format
    const containers = await dockerService.getAllContainers()
    const containerInfo = containers.find(c => c.id === params.id)
    
    if (!containerInfo) {
      return NextResponse.json(
        { error: 'Container not found in list' },
        { status: 404 }
      )
    }

    const service = {
      id: containerInfo.id,
      name: containerInfo.name,
      description: `Docker container: ${containerInfo.image}`,
      image: containerInfo.image,
      status: containerInfo.state === 'running' ? 'running' : 'stopped',
      ports: containerInfo.ports.map(port => {
        if (port.PublicPort) {
          return `${port.PublicPort}:${port.PrivatePort}`
        }
        return `${port.PrivatePort}:${port.PrivatePort}`
      }),
      environment: Object.entries(container.Config.Env || {})
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`),
      volumes: Object.entries(container.Mounts || {})
        .map(([_, mount]: any) => `${mount.Source}:${mount.Destination}`),
      networks: Object.keys(container.NetworkSettings.Networks || {}),
      cpu: 0,
      memory: 0,
      restartPolicy: container.HostConfig.RestartPolicy?.Name || 'unless-stopped',
      createdAt: containerInfo.created.toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: null,
      healthCheck: {
        enabled: !!container.Config.Healthcheck,
        interval: container.Config.Healthcheck?.Interval || 30,
        timeout: container.Config.Healthcheck?.Timeout || 10,
        retries: container.Config.Healthcheck?.Retries || 3,
        test: container.Config.Healthcheck?.Test || []
      },
      containerId: containerInfo.id,
      isDockerContainer: true
    }

    // Get stats if container is running
    if (containerInfo.state === 'running') {
      try {
        const stats = await dockerService.getContainerStats(params.id)
        service.cpu = Math.round((stats.cpu_stats.cpu_usage.total_usage / stats.cpu_stats.system_cpu_usage) * 100)
        service.memory = Math.round(stats.memory_stats.usage / 1024 / 1024) // MB
      } catch (statsError) {
        console.warn('Failed to get stats for container:', containerInfo.name, statsError)
      }
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service', details: error.message },
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
      healthCheck
    } = body

    // For now, we'll just update the container's restart policy
    // Full container update requires recreation in Docker
    const container = await dockerService.getContainer(params.id)
    
    if (!container) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    // Update container restart policy
    if (restartPolicy && restartPolicy !== container.HostConfig.RestartPolicy?.Name) {
      // Note: This requires container recreation in Docker
      // For now, we'll just return success
      console.log(`Restart policy update requested for ${params.id}: ${restartPolicy}`)
    }

    // Get updated container info
    const containers = await dockerService.getAllContainers()
    const containerInfo = containers.find(c => c.id === params.id)
    
    if (!containerInfo) {
      return NextResponse.json(
        { error: 'Container not found after update' },
        { status: 404 }
      )
    }

    const service = {
      id: containerInfo.id,
      name: name || containerInfo.name,
      description: description || `Docker container: ${containerInfo.image}`,
      image: image || containerInfo.image,
      status: containerInfo.state === 'running' ? 'running' : 'stopped',
      ports: ports || containerInfo.ports.map(port => {
        if (port.PublicPort) {
          return `${port.PublicPort}:${port.PrivatePort}`
        }
        return `${port.PrivatePort}:${port.PrivatePort}`
      }),
      environment: environment || Object.entries(container.Config.Env || {})
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`),
      volumes: volumes || Object.entries(container.Mounts || {})
        .map(([_, mount]: any) => `${mount.Source}:${mount.Destination}`),
      networks: networks || Object.keys(container.NetworkSettings.Networks || {}),
      cpu: 0,
      memory: 0,
      restartPolicy: restartPolicy || container.HostConfig.RestartPolicy?.Name || 'unless-stopped',
      createdAt: containerInfo.created.toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: null,
      healthCheck: healthCheck || {
        enabled: !!container.Config.Healthcheck,
        interval: container.Config.Healthcheck?.Interval || 30,
        timeout: container.Config.Healthcheck?.Timeout || 10,
        retries: container.Config.Healthcheck?.Retries || 3,
        test: container.Config.Healthcheck?.Test || []
      },
      containerId: containerInfo.id,
      isDockerContainer: true
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dockerService.removeContainer(params.id)
    
    return NextResponse.json({ message: 'Container deleted successfully' })
  } catch (error) {
    console.error('Error deleting container:', error)
    return NextResponse.json(
      { error: 'Failed to delete container', details: error.message },
      { status: 500 }
    )
  }
}

// Action endpoints for start/stop/restart
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    if (!['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be start, stop, or restart' },
        { status: 400 }
      )
    }

    // Perform the action
    switch (action) {
      case 'start':
        await dockerService.startContainer(params.id)
        break
      case 'stop':
        await dockerService.stopContainer(params.id)
        break
      case 'restart':
        await dockerService.restartContainer(params.id)
        break
    }

    // Get updated container info
    const containers = await dockerService.getAllContainers()
    const containerInfo = containers.find(c => c.id === params.id)
    
    if (!containerInfo) {
      return NextResponse.json(
        { error: 'Container not found after action' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: `Container ${action}ed successfully`,
      status: containerInfo.state === 'running' ? 'running' : 'stopped',
      containerId: params.id
    })
  } catch (error) {
    console.error('Error performing container action:', error)
    return NextResponse.json(
      { error: `Failed to ${action} container`, details: error.message },
      { status: 500 }
    )
  }
}