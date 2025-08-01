import { NextResponse } from 'next/server'
import { dockerService } from '@/lib/docker'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { containerId, command } = body

    if (!containerId || !command) {
      return NextResponse.json(
        { error: 'Container ID and command are required' },
        { status: 400 }
      )
    }

    // Execute command in container
    const result = await dockerService.execCommand(containerId, command)

    return NextResponse.json({
      output: result.output,
      exitCode: result.exitCode,
      containerId,
      command
    })
  } catch (error) {
    console.error('Error executing command:', error)
    return NextResponse.json(
      { error: 'Failed to execute command', details: error.message },
      { status: 500 }
    )
  }
}