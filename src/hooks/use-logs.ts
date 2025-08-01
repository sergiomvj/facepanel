'use client'

import { useState, useCallback, useEffect } from 'react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source: string
  containerId: string
  containerName: string
}

interface UseLogsProps {
  containerId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useLogs({ 
  containerId, 
  autoRefresh = true, 
  refreshInterval = 5000 
}: UseLogsProps = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  const fetchLogs = useCallback(async (options: { tail?: number; follow?: boolean } = {}) => {
    if (!containerId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/logs/container', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          containerId,
          options: {
            tail: options.tail || 100,
            follow: options.follow || false
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Parse Docker logs and convert to LogEntry format
        const parsedLogs: LogEntry[] = result.logs
          .split('\n')
          .filter(line => line.trim())
          .map((line: string, index: number) => {
            // Try to parse timestamp and level from Docker log format
            const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)?\s*(.+)$/)
            const message = timestampMatch ? timestampMatch[2] : line
            const timestamp = timestampMatch?.[1] ? new Date(timestampMatch[1]) : new Date()
            
            // Determine log level
            let level: LogEntry['level'] = 'info'
            if (message.toLowerCase().includes('error') || message.toLowerCase().includes('err')) {
              level = 'error'
            } else if (message.toLowerCase().includes('warn')) {
              level = 'warn'
            } else if (message.toLowerCase().includes('debug')) {
              level = 'debug'
            }

            return {
              id: `${containerId}-${index}-${Date.now()}`,
              timestamp,
              level,
              message,
              source: 'container',
              containerId,
              containerName: containerId // Will be updated with actual name
            }
          })

        setLogs(parsedLogs)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch logs')
      }
    } catch (error) {
      setError('Failed to fetch logs')
      console.error('Logs fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [containerId])

  const refreshLogs = useCallback(() => {
    fetchLogs({ tail: 100 })
  }, [fetchLogs])

  const followLogs = useCallback(() => {
    setIsFollowing(true)
    // For now, we'll use polling. In a real implementation, this would use WebSocket
    const interval = setInterval(() => {
      fetchLogs({ tail: 50, follow: true })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchLogs, refreshInterval])

  const stopFollowing = useCallback(() => {
    setIsFollowing(false)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const filterLogs = useCallback((level?: LogEntry['level'], searchTerm?: string) => {
    return logs.filter(log => {
      const matchesLevel = !level || log.level === level
      const matchesSearch = !searchTerm || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.containerName.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesLevel && matchesSearch
    })
  }, [logs])

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh && containerId && !isFollowing) {
      const interval = setInterval(refreshLogs, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, containerId, isFollowing, refreshInterval, refreshLogs])

  // Initial fetch
  useEffect(() => {
    if (containerId) {
      fetchLogs({ tail: 100 })
    }
  }, [containerId, fetchLogs])

  return {
    logs,
    isLoading,
    error,
    isFollowing,
    fetchLogs,
    refreshLogs,
    followLogs,
    stopFollowing,
    clearLogs,
    filterLogs
  }
}