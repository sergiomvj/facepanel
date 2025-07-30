import { FastifyInstance } from 'fastify'
import { 
  getSystemMetrics, 
  getServiceMetrics, 
  getProjectMetrics 
} from '../controllers/metrics.controller'
import { verifyUser } from '../middlewares/auth'

export default async function metricsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyUser)

  app.get('/system', getSystemMetrics)
  app.get('/service/:serviceId', getServiceMetrics)
  app.get('/project/:projectId', getProjectMetrics)
}
