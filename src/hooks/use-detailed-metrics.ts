'use client'

import { useState, useEffect } from 'react'

interface Process {
  pid: number
  name: string
  cpu: number
  memory: number
  user: string
  status: string
}

interface Connection {
  id: string
  local: string
  remote: string
  state: string
  protocol: string
}

interface MetricDataPoint {
  timestamp: number
  value: number
}

interface DetailedMetrics {
  cpu: {
    historical: MetricDataPoint[]
    processes: Process[]
    details: {
      cores: number
      temperature: number
    }
  }
  memory: {
    historical: MetricDataPoint[]
    processes: Process[]
    details: {
      total: number
      used: number
      available: number
    }
  }
  disk: {
    historical: MetricDataPoint[]
    processes: Process[]
    details: {
      total: number
      used: number
      available: number
    }
  }
  network: {
    historical: MetricDataPoint[]
    connections: Connection[]
    details: {
      download: number
      upload: number
    }
  }
}

export function useDetailedMetrics(refreshInterval = 30000) {
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/details')
      if (!response.ok) {
        throw new Error('Failed to fetch detailed metrics')
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