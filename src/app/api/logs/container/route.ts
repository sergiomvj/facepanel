import { NextResponse } from 'next/server'
import { dockerService } from '@/lib/docker'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { containerId, options = {} } = body

    if (!containerId) {
      return NextResponse.json(
        { error: 'Container ID is required' },
        { status: 400 }
      )
    }

    // Get container logs
    const logs = await dockerService.getContainerLogs(containerId, options)

    return NextResponse.json({
      logs,
      containerId,
      options
    })
  } catch (error) {
    console.error('Error fetching container logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch container logs', details: error.message },
      { status: 500 }
    )
  }
}