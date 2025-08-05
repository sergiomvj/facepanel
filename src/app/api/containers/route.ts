import { NextResponse } from 'next/server'
import { dockerService } from '@/lib/docker'

export async function GET() {
  try {
    const containers = await dockerService.getAllContainers()
    const containerList = containers.map(container => ({
      id: container.id,
      name: container.name,
    }))
    return NextResponse.json(containerList)
  } catch (error) {
    console.error('Failed to fetch containers:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to fetch containers', details: errorMessage },
      { status: 500 },
    )
  }
}
