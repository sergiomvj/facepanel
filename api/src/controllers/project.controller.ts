import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../config/supabase'

export async function getProjects(request: FastifyRequest, reply: FastifyReply) {
  const user = (request.user as any).sub
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user)

  if (error) return reply.status(500).send(error)
  return reply.send(data)
}

export async function createProject(request: FastifyRequest, reply: FastifyReply) {
  const { name, domain } = request.body as any
  const user = (request.user as any).sub

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, domain, user_id: user })
    .select()

  if (error) return reply.status(500).send(error)
  return reply.status(201).send(data)
}

export async function getProject(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const user = (request.user as any).sub

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user)
    .single()

  if (error) return reply.status(404).send({ error: 'Project not found' })
  return reply.send(data)
}

export async function updateProject(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const { name, domain } = request.body as any
  const user = (request.user as any).sub

  const { data, error } = await supabase
    .from('projects')
    .update({ name, domain })
    .eq('id', id)
    .eq('user_id', user)
    .select()

  if (error) return reply.status(500).send(error)
  return reply.send(data)
}

export async function deleteProject(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any
  const user = (request.user as any).sub

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user)

  if (error) return reply.status(500).send(error)
  return reply.status(204).send()
}
