'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { VPSCard } from '@/components/VPSCard'
import { AddVPSForm } from '@/components/AddVPSForm'
import { EditVPSForm } from '@/components/EditVPSForm'
import { VPS } from '@/types'

export default function Home() {
  const [vpsList, setVpsList] = useState<VPS[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVPS, setEditingVPS] = useState<VPS | null>(null)

  const fetchVPS = async () => {
    try {
      const response = await fetch('/api/vps')
      const data = await response.json()
      if (data.success) {
        setVpsList(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch VPS:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAllVPSStatus = async () => {
    setCheckingStatus(true)
    try {
      const response = await fetch('/api/vps/check-all', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        // Atualizar a lista após verificar
        await fetchVPS()
      }
    } catch (error) {
      console.error('Failed to check VPS status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  useEffect(() => {
    fetchVPS()
  }, [])

  const handleVPSClick = (vps: VPS) => {
    // Navigate to VPS detail page
    window.location.href = `/vps/${vps.id}`
  }

  const handleEditVPS = (vps: VPS) => {
    setEditingVPS(vps)
  }

  const handleAddVPS = () => {
    setShowAddForm(true)
  }

  const handleFormSuccess = () => {
    fetchVPS() // Reload the list
  }

  // Calculate stats
  const totalVPS = vpsList.length
  const onlineVPS = vpsList.filter(vps => vps.status === 'online').length
  const offlineVPS = vpsList.filter(vps => vps.status === 'offline').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Listagem de VPS */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12 text-gray-400">Carregando VPS...</div>
                ) : vpsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vpsList.map(vps => (
                      <VPSCard 
                        key={vps.id} 
                        vps={vps} 
                        onClick={handleVPSClick}
                        onEdit={handleEditVPS}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      Nenhuma VPS cadastrada ainda
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {showAddForm && (
        <AddVPSForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {editingVPS && (
        <EditVPSForm 
          vps={editingVPS}
          onClose={() => setEditingVPS(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
