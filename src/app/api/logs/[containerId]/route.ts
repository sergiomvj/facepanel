import { NextResponse } from 'next/server'
import { dockerService } from '@/lib/docker'

export async function GET(
  request: Request,
  { params }: { params: { containerId: string } },
) {
  const { containerId } = params
  const { searchParams } = new URL(request.url)
  const tail = searchParams.get('tail') || '100'

  try {
    const logs = await dockerService.getContainerLogs(containerId, parseInt(tail, 10))
    return NextResponse.json({ logs })
  } catch (error) {
    console.error(`Failed to fetch logs for container ${containerId}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: errorMessage },
      { status: 500 },
    )
  }
}
