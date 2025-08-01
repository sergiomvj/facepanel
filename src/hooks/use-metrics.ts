'use client'

import { useState, useEffect } from 'react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    usage: number
    total: number
    used: number
    available: number
  }
  disk: {
    usage: number
    total: number
    used: number
    free: number
  }
  network: {
    download: number
    upload: number
    totalDownload: number
    totalUpload: number
  }
  system: {
    uptime: number
    loadAverage: number[]
    processes: number
  }
  historical: {
    cpu: Array<{ time: string; value: number }>
    memory: Array<{ time: string; value: number }>
    disk: Array<{ time: string; value: number }>
    network: Array<{ time: string; value: number }>
  }
  details: {
    processes: Array<{
      pid: number
      name: string
      cpu: number
      memory: number
      user: string
      status: string
    }>
    connections: Array<{
      id: string
      local: string
      remote: string
      protocol: string
      state: string
      bytesSent: number
      bytesReceived: number
    }>
    diskUsage: Array<{
      name: string
      used: number
      total: number
      percentage: number
    }>
    networkInterfaces: Array<{
      name: string
      download: number
      upload: number
    }>
  }
  timestamp: number
}

export function useMetrics(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { metrics, loading, error, refetch: fetchMetrics }
}