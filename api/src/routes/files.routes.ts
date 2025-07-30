import { FastifyInstance } from 'fastify'
import { 
  uploadFile, 
  getFiles, 
  deleteFile 
} from '../controllers/files.controller'
import { verifyUser } from '../middlewares/auth'

export default async function filesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyUser)

  app.post('/:projectId/upload', uploadFile)
  app.get('/:projectId', getFiles)
  app.delete('/:projectId/:fileId', deleteFile)
}
