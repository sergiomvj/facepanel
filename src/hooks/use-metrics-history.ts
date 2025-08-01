'use client'

import { useState, useEffect } from 'react'

interface MetricDataPoint {
  timestamp: number
  value: number
}

interface MetricsHistory {
  cpu: MetricDataPoint[]
  memory: MetricDataPoint[]
  disk: MetricDataPoint[]
  network: {
    download: MetricDataPoint[]
    upload: MetricDataPoint[]
  }
}

export function useMetricsHistory(interval = 5000, maxPoints = 60) {
  const [metrics, setMetrics] = useState<MetricsHistory>({
    cpu: [],
    memory: [],
    disk: [],
    network: {
      download: [],
      upload: []
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateMockData = (baseValue: number, variance: number): MetricDataPoint => {
    return {
      timestamp: Date.now(),
      value: Math.round(Math.max(0, baseValue + (Math.random() - 0.5) * variance))
    }
  }

  const fetchMetrics = async () => {
    try {
      // Simulate API call - in a real implementation, this would fetch from your metrics API
      const newMetrics: MetricsHistory = {
        cpu: [...metrics.cpu.slice(-maxPoints + 1), generateMockData(45, 20)],
        memory: [...metrics.memory.slice(-maxPoints + 1), generateMockData(62, 15)],
        disk: [...metrics.disk.slice(-maxPoints + 1), generateMockData(78, 10)],
        network: {
          download: [...metrics.network.download.slice(-maxPoints + 1), generateMockData(13, 8)],
          upload: [...metrics.network.upload.slice(-maxPoints + 1), generateMockData(5, 4)]
        }
      }

      setMetrics(newMetrics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const intervalId = setInterval(fetchMetrics, interval)
    return () => clearInterval(intervalId)
  }, [interval, maxPoints])

  return { metrics, loading, error, refetch: fetchMetrics }
}