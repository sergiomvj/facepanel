import { FastifyRequest, FastifyReply } from 'fastify'
import { metricsService } from '../services/metrics.service'

export async function getSystemMetrics(request: FastifyRequest, reply: FastifyReply) {
  try {
    const metrics = await metricsService.getSystemMetrics()
    return reply.send(metrics)
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}

export async function getServiceMetrics(request: FastifyRequest, reply: FastifyReply) {
  const { serviceId } = request.params as any
  const user = (request.user as any).sub

  try {
    const metrics = await metricsService.getServiceMetrics(serviceId, user)
    return reply.send(metrics)
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}

export async function getProjectMetrics(request: FastifyRequest, reply: FastifyReply) {
  const { projectId } = request.params as any
  const user = (request.user as any).sub

  try {
    const metrics = await metricsService.getProjectMetrics(projectId, user)
    return reply.send(metrics)
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}
