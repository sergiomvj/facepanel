import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Installation - FacePanel',
  description: 'Instalar novos serviços em suas VPS',
}

export default function InstallPage() {
  const templates = [
    {
      id: 'nextjs',
      name: 'Next.js Application',
      description: 'Deploy a Next.js application with Nginx reverse proxy',
      category: 'Frontend',
      icon: '⚛️'
    },
    {
      id: 'supabase',
      name: 'Supabase Stack',
      description: 'Complete Supabase stack with PostgreSQL, API, and Dashboard',
      category: 'Database',
      icon: '🗄️'
    },
    {
      id: 'ollama',
      name: 'Ollama AI Server',
      description: 'Self-hosted AI server with Ollama and web interface',
      category: 'AI/ML',
      icon: '🤖'
    },
    {
      id: 'n8n',
      name: 'N8N Automation',
      description: 'Workflow automation platform with database',
      category: 'Automation',
      icon: '🔄'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instalação de Serviços
          </h1>
          <p className="text-gray-600 mt-2">
            Escolha um template e instale novos serviços em suas VPS
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{template.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 text-sm">
                  {template.description}
                </p>
                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Instalar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Instalações Recentes</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma instalação recente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
