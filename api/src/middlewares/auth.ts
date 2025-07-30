import { FastifyRequest, FastifyReply } from 'fastify'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
