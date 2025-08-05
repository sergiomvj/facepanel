/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebSocketServer, WebSocket } from 'ws'
import Docker from 'dockerode'
import stream from 'stream'

// Use a try-catch block for Docker initialization for better error handling
let docker: Docker
try {
  docker = new Docker()
} catch (error) {
  console.error('Error initializing Docker. Is the Docker daemon running?', error)
  process.exit(1)
}

const wss = new WebSocketServer({ port: 3001 })

console.log('WebSocket server for terminal started on ws://localhost:3001')

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to WebSocket server')

  let execStream: stream.Duplex | null = null
  let execInstance: Docker.Exec | null = null

  const cleanup = () => {
    if (execStream) {
      execStream.end()
      execStream.removeAllListeners()
      execStream = null
    }
    execInstance = null
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
    console.log('Cleaned up resources for a client.')
  }

  ws.on('message', async (message: Buffer) => {
    try {
      const messageStr = message.toString()

      // Check if the message is a JSON command or raw input
      if (messageStr.startsWith('{')) {
        const msg = JSON.parse(messageStr)

        if (msg.type === 'start' && msg.containerId) {
          console.log(`Attempting to attach to container: ${msg.containerId}`)
          const container = docker.getContainer(msg.containerId)

          execInstance = await container.exec({
            Cmd: ['/bin/sh', '-c', 'TERM=xterm-256color; export TERM; /bin/sh'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
          })

          execStream = await execInstance.start({ hijack: true, stdin: true })

          if (!execStream) {
            throw new Error('Failed to start exec stream.')
          }

          // Forward container output to the client
          execStream.on('data', (chunk) => {
            ws.send(chunk.toString('utf8'))
          })

          execStream.on('end', () => {
            console.log('Exec stream ended.')
            cleanup()
          })

          console.log('Terminal session started successfully.')
        } else if (msg.type === 'resize' && msg.cols && msg.rows) {
          if (execInstance) {
            await execInstance.resize({ h: msg.rows, w: msg.cols })
          }
        }
      } else if (execStream) {
        // This is raw input from the terminal, forward it to the container
        execStream.write(message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error('Error during WebSocket communication:', errorMessage)
      ws.send(JSON.stringify({ type: 'error', data: errorMessage }))
      cleanup()
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected.')
    cleanup()
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    cleanup()
  })
})
