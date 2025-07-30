import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../config/supabase'
import { dockerService } from '../services/docker.service'

export async function getServices(request: FastifyRequest, reply: FastifyReply) {
  const { projectId } = request.params as any
  const user = (request.user as any).sub

  // Verificar se o projeto pertence ao usuário
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user)
    .single()

  if (!project) return reply.status(404).send({ error: 'Project not found' })

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('project_id', projectId)

  if (error) return reply.status(500).send(error)
  return reply.send(data)
}

export async function createService(request: FastifyRequest, reply: FastifyReply) {
  const { projectId } = request.params as any
  const { name, image, ports, environment } = request.body as any
  const user = (request.user as any).sub

  // Verificar se o projeto pertence ao usuário
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user)
    .single()

  if (!project) return reply.status(404).send({ error: 'Project not found' })

  const { data, error } = await supabase
    .from('services')
    .insert({ 
      name, 
      image, 
      ports, 
      environment, 
      project_id: projectId,
      status: 'stopped'
    })
    .select()

  if (error) return reply.status(500).send(error)
  return reply.status(201).send(data)
}

export async function startService(request: FastifyRequest, reply: FastifyReply) {
  const { projectId, serviceId } = request.params as any
  const user = (request.user as any).sub

  try {
    const result = await dockerService.startContainer(serviceId, user)
    return reply.send(result)
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}

export async function stopService(request: FastifyRequest, reply: FastifyReply) {
  const { projectId, serviceId } = request.params as any
  const user = (request.user as any).sub

  try {
    const result = await dockerService.stopContainer(serviceId, user)
    return reply.send(result)
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}

export async function getServiceLogs(request: FastifyRequest, reply: FastifyReply) {
  const { projectId, serviceId } = request.params as any
  const user = (request.user as any).sub

  try {
    const logs = await dockerService.getContainerLogs(serviceId, user)
    return reply.send({ logs })
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}
