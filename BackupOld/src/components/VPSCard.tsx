'use client'

import { VPS } from '@/types'
import { cn, getStatusColor } from '@/lib/utils'
import { useVpsServices } from '@/lib/useVpsServices'
import { useVpsResources } from '@/lib/useVpsResources'
import { PieChart } from './PieChart'
import { useState } from 'react'

interface VPSCardProps {
  vps: VPS
  onClick?: (vps: VPS) => void
  onEdit?: (vps: VPS) => void
}

export function VPSCard({ vps, onClick, onEdit }: VPSCardProps) {
  const statusColor = getStatusColor(vps.status)
  const { services, loading, error } = useVpsServices(vps.id)
  const { resources, loading: loadingResources, error: errorResources } = useVpsResources(vps.id)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(vps)
  }

  async function handleServiceAction(type: 'reiniciar' | 'remover' | 'instalar', service?: any) {
    setActionLoading(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      if (type === 'reiniciar' && service) {
        await fetch(`/api/vps/${vps.id}/services`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: service.id, status: 'executando' })
        })
        setActionSuccess('Serviço reiniciado com sucesso!')
      }
      if (type === 'remover' && service) {
        await fetch(`/api/vps/${vps.id}/services`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId: service.id })
        })
        setActionSuccess('Serviço removido com sucesso!')
      }
      if (type === 'instalar') {
        const name = prompt('Nome do serviço:')
        const sType = prompt('Tipo (wordpress, serverweb, n8n, evolution, chatwoot, portainer, outro):')
        if (!name || !sType) throw new Error('Dados obrigatórios não informados')
        await fetch(`/api/vps/${vps.id}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type: sType })
        })
        setActionSuccess('Serviço instalado com sucesso!')
      }
      setTimeout(() => { window.location.reload() }, 1200)
    } catch (err: any) {
      setActionError('Erro ao executar ação')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(vps)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{vps.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusColor)}>
              {vps.status}
            </span>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar VPS"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>IP:</span>
            <span className="font-mono">{vps.ip}:{vps.port}</span>
          </div>

          <div className="flex justify-between">
            <span>Usuário:</span>
            <span>{vps.username}</span>
          </div>

          <div className="flex justify-between">
            <span>Última vez visto:</span>
            <span>{new Date(vps.lastSeen).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {vps.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {vps.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos de recursos */}
        <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
          {loadingResources && <span className="text-xs text-gray-400">Carregando recursos...</span>}
          {errorResources && <span className="text-xs text-red-500">{errorResources}</span>}
          {resources && (
            <>
              <PieChart label="CPU" value={resources.cpu} />
              <PieChart label="Memória" value={resources.memory} />
              <PieChart label="Disco" value={resources.disk} />
              <PieChart label="Bandwidth" value={resources.bandwidth} />
            </>
          )}
        </div>

        {/* Serviços instalados */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Serviços instalados:</h4>
          {loading && <span className="text-xs text-gray-400">Carregando...</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
          {!loading && services.length === 0 && <span className="text-xs text-gray-400">Nenhum serviço encontrado.</span>}
          <ul className="list-disc pl-5 text-xs">
            {services.map(service => (
              <li key={service.id} className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-bold">{service.name}</span> <span className="text-gray-500">({service.type})</span> - <span className="text-green-600">{service.status}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    title="Reiniciar"
                    disabled={actionLoading}
                    onClick={() => handleServiceAction('reiniciar', service)}
                  >{actionLoading ? '...' : 'Reiniciar'}</button>
                  <button
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    title="Remover"
                    disabled={actionLoading}
                    onClick={() => handleServiceAction('remover', service)}
                  >{actionLoading ? '...' : 'Remover'}</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <button
              className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              title="Instalar novo serviço"
              disabled={actionLoading}
              onClick={() => handleServiceAction('instalar')}
            >{actionLoading ? '...' : 'Instalar novo serviço'}</button>
          </div>
          {actionError && <div className="mt-2 text-xs text-red-600">{actionError}</div>}
          {actionSuccess && <div className="mt-2 text-xs text-green-600">{actionSuccess}</div>}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              Visualizar
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
              Gerenciar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
