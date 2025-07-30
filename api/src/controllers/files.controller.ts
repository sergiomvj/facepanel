import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../config/supabase'

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
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

  try {
    // Aqui você implementaria o upload do arquivo
    // Por exemplo, usando multer ou similar
    return reply.send({ message: 'File uploaded successfully' })
  } catch (error) {
    return reply.status(500).send({ error: (error as Error).message })
  }
}

export async function getFiles(request: FastifyRequest, reply: FastifyReply) {
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
    .from('files')
    .select('*')
    .eq('project_id', projectId)

  if (error) return reply.status(500).send(error)
  return reply.send(data)
}

export async function deleteFile(request: FastifyRequest, reply: FastifyReply) {
  const { projectId, fileId } = request.params as any
  const user = (request.user as any).sub

  // Verificar se o projeto pertence ao usuário
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user)
    .single()

  if (!project) return reply.status(404).send({ error: 'Project not found' })

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('project_id', projectId)

  if (error) return reply.status(500).send(error)
  return reply.status(204).send()
}
