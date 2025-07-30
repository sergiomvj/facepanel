import { FastifyInstance } from 'fastify'
import { 
  getServices, 
  createService, 
  startService, 
  stopService, 
  getServiceLogs 
} from '../controllers/service.controller'
import { verifyUser } from '../middlewares/auth'

export default async function serviceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyUser)

  app.get('/:projectId/services', getServices)
  app.post('/:projectId/services', createService)
  app.post('/:projectId/services/:serviceId/start', startService)
  app.post('/:projectId/services/:serviceId/stop', stopService)
  app.get('/:projectId/services/:serviceId/logs', getServiceLogs)
}
