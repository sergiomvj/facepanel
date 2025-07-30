Aqui está o **esqueleto inicial do projeto `api/` do backend do PanelX**, com estrutura pensada para escalar e integrar com Docker, Supabase, WebSocket e gerenciamento seguro de múltiplos projetos:

---

### 📁 Estrutura de Diretórios `api/`

```bash
api/
├── src/
│   ├── config/
│   │   ├── supabase.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── project.controller.ts
│   │   ├── service.controller.ts
│   │   ├── metrics.controller.ts
│   │   └── files.controller.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── project.routes.ts
│   │   ├── service.routes.ts
│   │   ├── metrics.routes.ts
│   │   └── files.routes.ts
│   ├── services/
│   │   ├── docker.service.ts
│   │   ├── metrics.service.ts
│   │   └── supabase.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── index.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

### 📦 `package.json` (dependências principais)

```json
{
  "name": "panelx-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "fastify": "^4.26.1",
    "fastify-cors": "^8.5.0",
    "fastify-jwt": "^6.1.2",
    "fastify-websocket": "^8.1.0",
    "dotenv": "^16.3.1",
    "dockerode": "^4.0.0",
    "@supabase/supabase-js": "^2.39.5"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.3"
  }
}
```

---

### 🧠 `src/index.ts` (ponto de entrada)

```ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import dotenv from 'dotenv'
import jwt from '@fastify/jwt'

import projectRoutes from './routes/project.routes.js'
import serviceRoutes from './routes/service.routes.js'
import metricsRoutes from './routes/metrics.routes.js'
import filesRoutes from './routes/files.routes.js'

dotenv.config()

const app = Fastify()

app.register(cors)
app.register(websocket)
app.register(jwt, { secret: process.env.JWT_SECRET! })

app.register(projectRoutes, { prefix: '/projects' })
app.register(serviceRoutes, { prefix: '/services' })
app.register(metricsRoutes, { prefix: '/metrics' })
app.register(filesRoutes, { prefix: '/files' })

app.listen({ port: 3000 }, (err) => {
  if (err) throw err
  console.log('PanelX API running on http://localhost:3000')
})
```

---

### 🔐 `src/middlewares/auth.ts`

```ts
import { FastifyRequest, FastifyReply } from 'fastify'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
```

---

### 🧪 Exemplo de Rota `src/routes/project.routes.ts`

```ts
import { FastifyInstance } from 'fastify'
import { getProjects, createProject } from '../controllers/project.controller.js'
import { verifyUser } from '../middlewares/auth.js'

export default async function projectRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyUser)

  app.get('/', getProjects)
  app.post('/', createProject)
}
```

---

### 🔧 `src/config/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

### 🧪 Exemplo de Controller `src/controllers/project.controller.ts`

```ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../config/supabase.js'

export async function getProjects(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user.sub
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user)

  if (error) return reply.status(500).send(error)
  return reply.send(data)
}

export async function createProject(request: FastifyRequest, reply: FastifyReply) {
  const { name, domain } = request.body as any
  const user = request.user.sub

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, domain, user_id: user })
    .select()

  if (error) return reply.status(500).send(error)
  return reply.status(201).send(data)
}
```

---

### 📄 `.env.example`

```
PORT=3000
JWT_SECRET=umsegredobemseguro123
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxx
```

---

### ✅ Próximos passos sugeridos

Deseja que eu:

1. Gere o `Dockerfile` e `docker-compose.yml` para esse backend?
2. Inicie os arquivos dos serviços (`docker.service.ts`, `metrics.service.ts`)?
3. Adicione estrutura para WebSocket de terminal/logs?
4. Gere um ZIP com essa estrutura para facilitar o download?

Me diga o que prefere que eu entregue a seguir.
