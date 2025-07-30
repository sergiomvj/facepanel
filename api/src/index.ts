import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import dotenv from 'dotenv'
import jwt from '@fastify/jwt'
import os from 'os'

import projectRoutes from './routes/project.routes'
import serviceRoutes from './routes/service.routes'
import metricsRoutes from './routes/metrics.routes'
import filesRoutes from './routes/files.routes'
import { Logger } from './utils/logger'

dotenv.config()

const app = Fastify({ logger: true })

// Store WebSocket connections
const connections = new Map<string, any>()

app.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
  credentials: true
})

app.register(websocket)
app.register(jwt, { secret: process.env.JWT_SECRET! })

// WebSocket route for real-time communication
app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const connectionId = Math.random().toString(36).substring(7)
    connections.set(connectionId, {
      socket: connection.socket,
      authenticated: false,
      userId: null
    })
    
    Logger.info(`WebSocket connection established: ${connectionId}`)
    
    connection.socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        await handleWebSocketMessage(connectionId, data)
      } catch (error) {
        Logger.error('Error parsing WebSocket message:', error as Error)
      }
    })
    
    connection.socket.on('close', () => {
      connections.delete(connectionId)
      Logger.info(`WebSocket connection closed: ${connectionId}`)
    })
    
    connection.socket.on('error', (error) => {
      Logger.error(`WebSocket error for ${connectionId}:`, error)
      connections.delete(connectionId)
    })
  })
})

// Handle WebSocket messages
async function handleWebSocketMessage(connectionId: string, data: any) {
  const connection = connections.get(connectionId)
  if (!connection) return
  
  switch (data.type) {
    case 'auth':
      try {
        const decoded = app.jwt.verify(data.token) as any
        connection.authenticated = true
        connection.userId = decoded.sub
        
        connection.socket.send(JSON.stringify({
          type: 'auth_success',
          payload: { userId: decoded.sub }
        }))
        
        Logger.info(`WebSocket authenticated for user: ${decoded.sub}`)
      } catch (error) {
        connection.socket.send(JSON.stringify({
          type: 'auth_error',
          payload: { message: 'Invalid token' }
        }))
      }
      break
      
    case 'subscribe_metrics':
      if (connection.authenticated) {
        connection.subscriptions = connection.subscriptions || []
        connection.subscriptions.push('metrics')
        Logger.info(`User ${connection.userId} subscribed to metrics`)
      }
      break
      
    case 'subscribe_logs':
      if (connection.authenticated) {
        connection.subscriptions = connection.subscriptions || []
        connection.subscriptions.push('logs')
        connection.projectId = data.projectId
        Logger.info(`User ${connection.userId} subscribed to logs for project ${data.projectId}`)
      }
      break
      
    case 'terminal_command':
      if (connection.authenticated && data.command) {
        // Handle terminal command execution
        executeTerminalCommand(connectionId, data.command, data.serviceId)
      }
      break
  }
}

// Execute terminal command and stream output
async function executeTerminalCommand(connectionId: string, command: string, serviceId: string) {
  const connection = connections.get(connectionId)
  if (!connection || !connection.authenticated) return
  
  try {
    // This is a simplified implementation
    // In a real scenario, you'd execute the command in the Docker container
    connection.socket.send(JSON.stringify({
      type: 'terminal_output',
      payload: {
        text: `$ ${command}`,
        serviceId
      }
    }))
    
    // Simulate command execution
    setTimeout(() => {
      connection.socket.send(JSON.stringify({
        type: 'terminal_output',
        payload: {
          text: `Command executed: ${command}`,
          serviceId
        }
      }))
    }, 100)
    
  } catch (error) {
    connection.socket.send(JSON.stringify({
      type: 'terminal_error',
      payload: {
        message: (error as Error).message,
        serviceId
      }
    }))
  }
}

// Broadcast message to all authenticated connections
function broadcastToAuthenticated(message: any) {
  connections.forEach((connection) => {
    if (connection.authenticated && connection.socket.readyState === 1) {
      connection.socket.send(JSON.stringify(message))
    }
  })
}

// Broadcast to specific user
function broadcastToUser(userId: string, message: any) {
  connections.forEach((connection) => {
    if (connection.authenticated && connection.userId === userId && connection.socket.readyState === 1) {
      connection.socket.send(JSON.stringify(message))
    }
  })
}

// Broadcast to subscribers of a specific type
function broadcastToSubscribers(subscriptionType: string, message: any, filter?: (connection: any) => boolean) {
  connections.forEach((connection) => {
    if (connection.authenticated && 
        connection.subscriptions?.includes(subscriptionType) &&
        connection.socket.readyState === 1 &&
        (!filter || filter(connection))) {
      connection.socket.send(JSON.stringify(message))
    }
  })
}

// Export broadcast functions for use in other modules
export { broadcastToAuthenticated, broadcastToUser, broadcastToSubscribers }

app.register(projectRoutes, { prefix: '/projects' })
app.register(serviceRoutes, { prefix: '/services' })
app.register(metricsRoutes, { prefix: '/metrics' })
app.register(filesRoutes, { prefix: '/files' })

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
    console.log('PanelX API running on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
