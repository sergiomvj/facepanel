import { FastifyInstance } from 'fastify'
import { 
  getProjects, 
  createProject, 
  getProject, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller'
import { verifyUser } from '../middlewares/auth'

export default async function projectRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyUser)

  app.get('/', getProjects)
  app.post('/', createProject)
  app.get('/:id', getProject)
  app.put('/:id', updateProject)
  app.delete('/:id', deleteProject)
}
