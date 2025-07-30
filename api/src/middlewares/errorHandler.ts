import { FastifyRequest, FastifyReply } from 'fastify'

export async function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
  const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500
  
  reply.status(statusCode).send({
    error: {
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url
    }
  })
}
