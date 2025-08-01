'use client'

import { useState, useEffect } from 'react'

export interface Service {
  id: string
  name: string
  description: string
  image: string
  status: 'running' | 'stopped' | 'creating' | 'restarting' | 'error'
  ports: string[]
  environment: string[]
  volumes: string[]
  networks: string[]
  cpu: number
  memory: number
  restartPolicy: string
  createdAt: string
  updatedAt: string
  projectId: string | null
  healthCheck: {
    enabled: boolean
    interval: number
    timeout: number
    retries: number
    test: string[]
  }
}

export interface ServiceBlueprint {
  id: string
  name: string
  description: string
  image: string
  category: string
  ports: string[]
  environment: Array<{
    name: string
    default: string
    description: string
  }>
  volumes: Array<{
    path: string
    description: string
  }>
  networks: string[]
  healthCheck: {
    enabled: boolean
    test: string[]
  }
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [blueprints, setBlueprints] = useState<ServiceBlueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      setServices(data.services)
      setBlueprints(data.blueprints)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createService = async (serviceData: {
    name: string
    description?: string
    image: string
    ports?: string[]
    environment?: string[]
    volumes?: string[]
    networks?: string[]
    restartPolicy?: string
    projectId?: string
    healthCheck?: Service['healthCheck']
  }) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to create service')
      }

      const newService = await response.json()
      setServices(prev => [...prev, newService])
      return newService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      const updatedService = await response.json()
      setServices(prev => prev.map(s => s.id === id ? updatedService : s))
      return updatedService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const startService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!response.ok) {
        throw new Error('Failed to start service')
      }

      const result = await response.json()
      setServices(prev => 
        prev.map(s => s.id === id ? { ...s, status: result.status } : s)
      )
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const stopService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      })

      if (!response.ok) {
        throw new Error('Failed to stop service')
      }

      const result = await response.json()
      setServices(prev => 
        prev.map(s => s.id === id ? { ...s, status: result.status } : s)
      )
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const restartService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restart' }),
      })

      if (!response.ok) {
        throw new Error('Failed to restart service')
      }

      const result = await response.json()
      setServices(prev => 
        prev.map(s => s.id === id ? { ...s, status: result.status } : s)
      )
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const createServiceFromBlueprint = async (
    blueprintId: string, 
    config: {
      name: string
      environment?: Record<string, string>
      ports?: string[]
      volumes?: string[]
      networks?: string[]
      projectId?: string
    }
  ) => {
    const blueprint = blueprints.find(b => b.id === blueprintId)
    if (!blueprint) {
      throw new Error('Blueprint not found')
    }

    const environment = blueprint.environment.map(env => 
      `${env.name}=${config.environment?.[env.name] || env.default}`
    )

    return createService({
      name: config.name,
      description: blueprint.description,
      image: blueprint.image,
      ports: config.ports || blueprint.ports,
      environment,
      volumes: config.volumes || blueprint.volumes.map(v => v.path),
      networks: config.networks || blueprint.networks,
      projectId: config.projectId,
      healthCheck: blueprint.healthCheck
    })
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return {
    services,
    blueprints,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    startService,
    stopService,
    restartService,
    createServiceFromBlueprint,
    refetch: fetchServices
  }
}