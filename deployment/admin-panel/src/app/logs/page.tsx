'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Database, 
  Search, 
  Download, 
  RotateCcw, 
  Pause, 
  Play,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  container: string
  message: string
  source: string
}

interface LogFilter {
  level: string[]
  containers: string[]
  search: string
  startDate?: Date
  endDate?: Date
  autoRefresh: boolean
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [isTailEnabled, setIsTailEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  
  const [filter, setFilter] = useState<LogFilter>({
    level: ['info', 'warn', 'error', 'debug'],
    containers: [],
    search: '',
    autoRefresh: true
  })

  const logsEndRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Mock containers
  const containers = ['web-server', 'api-server', 'database', 'redis-cache', 'nginx-proxy']

  // Generate mock logs
  const generateMockLogs = () => {
    const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug']
    const messages = {
      info: [
        'Server started on port 3000',
        'Database connection established',
        'Cache initialized successfully',
        'Health check passed',
        'Configuration loaded',
        'Worker process started',
        'Client connected',
        'Request processed successfully'
      ],
      warn: [
        'High memory usage detected',
        'Slow query detected',
        'Deprecated API endpoint used',
        'Certificate expiring soon',
        'Disk space running low',
        'Rate limit approaching',
        'Connection pool nearly full'
      ],
      error: [
        'Failed to connect to database',
        'Internal server error',
        'Authentication failed',
        'File not found',
        'Permission denied',
        'Network timeout',
        'Service unavailable'
      ],
      debug: [
        'Debug: Processing request',
        'Debug: Cache miss',
        'Debug: Database query executed',
        'Debug: Response headers set',
        'Debug: Middleware executed',
        'Debug: Session created'
      ]
    }

    const newLogs: LogEntry[] = []
    const now = new Date()
    
    for (let i = 0; i < 10; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)]
      const container = containers[Math.floor(Math.random() * containers.length)]
      const levelMessages = messages[level]
      const message = levelMessages[Math.floor(Math.random() * levelMessages.length)]
      
      newLogs.push({
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date(now.getTime() - Math.random() * 60000), // Random time within last minute
        level,
        container,
        message,
        source: `${container}[${Math.floor(Math.random() * 100)}]`
      })
    }

    return newLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  const applyFilters = (logsToFilter: LogEntry[]) => {
    return logsToFilter.filter(log => {
      // Level filter
      if (filter.level.length > 0 && !filter.level.includes(log.level)) {
        return false
      }

      // Container filter
      if (filter.containers.length > 0 && !filter.containers.includes(log.container)) {
        return false
      }

      // Search filter
      if (filter.search && !log.message.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }

      // Date range filter
      if (filter.startDate && log.timestamp < filter.startDate) {
        return false
      }
      if (filter.endDate && log.timestamp > filter.endDate) {
        return false
      }

      return true
    })
  }

  const loadLogs = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newLogs = generateMockLogs()
      setLogs(prev => [...prev, ...newLogs].slice(-1000)) // Keep last 1000 logs
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshLogs = () => {
    loadLogs()
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.container}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleTail = () => {
    setIsTailEnabled(!isTailEnabled)
  }

  // Auto-refresh logic
  useEffect(() => {
    if (!filter.autoRefresh) return

    const interval = setInterval(() => {
      if (isTailEnabled) {
        loadLogs()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [filter.autoRefresh, isTailEnabled])

  // Initial load
  useEffect(() => {
    loadLogs()
  }, [])

  // Apply filters when logs or filter changes
  useEffect(() => {
    const filtered = applyFilters(logs)
    setFilteredLogs(filtered)
  }, [logs, filter])

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isTailEnabled && filteredLogs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, isTailEnabled])

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const filtered = applyFilters(logs)
      setFilteredLogs(filtered)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filter.search, logs])

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'debug':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500'
      case 'warn':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      case 'debug':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const getLogStats = () => {
    const stats = {
      total: filteredLogs.length,
      error: filteredLogs.filter(l => l.level === 'error').length,
      warn: filteredLogs.filter(l => l.level === 'warn').length,
      info: filteredLogs.filter(l => l.level === 'info').length,
      debug: filteredLogs.filter(l => l.level === 'debug').length
    }
    return stats
  }

  const stats = getLogStats()

  if (isFullscreen) {
    return (
      <div className="h-screen bg-background p-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Container Logs</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={refreshLogs} disabled={loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col">
            {/* Log Header */}
            <div className="border-b border-gray-700 p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isTailEnabled}
                    onCheckedChange={toggleTail}
                  />
                  <span className="text-xs">Tail</span>
                </div>
                <div className="text-xs text-gray-400">
                  Showing {filteredLogs.length} logs
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={downloadLogs}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearLogs}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No logs found
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="mb-1 hover:bg-gray-900 p-1 rounded">
                    <span className="text-gray-500 text-xs">
                      [{formatTime(log.timestamp)}]
                    </span>
                    <span className={`text-xs font-semibold ml-2 ${getLevelColor(log.level)}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      [{log.container}]
                    </span>
                    <span className="ml-2 text-green-400">
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card/50 flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Container Logs</h1>
            <p className="text-sm text-muted-foreground">View and search container logs</p>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Level Filter */}
            <div>
              <Label className="text-sm font-medium">Log Levels</Label>
              <div className="space-y-2 mt-2">
                {(['error', 'warn', 'info', 'debug'] as const).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Switch
                      id={`level-${level}`}
                      checked={filter.level.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilter(prev => ({
                            ...prev,
                            level: [...prev.level, level]
                          }))
                        } else {
                          setFilter(prev => ({
                            ...prev,
                            level: prev.level.filter(l => l !== level)
                          }))
                        }
                      }}
                    />
                    <label htmlFor={`level-${level}`} className="text-sm flex items-center gap-1">
                      {getLevelIcon(level)}
                      <span className="capitalize">{level}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Container Filter */}
            <div>
              <Label className="text-sm font-medium">Containers</Label>
              <div className="space-y-2 mt-2">
                {containers.map((container) => (
                  <div key={container} className="flex items-center space-x-2">
                    <Switch
                      id={`container-${container}`}
                      checked={filter.containers.includes(container)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilter(prev => ({
                            ...prev,
                            containers: [...prev.containers, container]
                          }))
                        } else {
                          setFilter(prev => ({
                            ...prev,
                            containers: prev.containers.filter(c => c !== container)
                          }))
                        }
                      }}
                    />
                    <label htmlFor={`container-${container}`} className="text-sm">
                      {container}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Auto Refresh</Label>
              <Switch
                checked={filter.autoRefresh}
                onCheckedChange={(checked) => setFilter(prev => ({ ...prev, autoRefresh: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={refreshLogs}
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh Logs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={downloadLogs}
                disabled={filteredLogs.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Logs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={clearLogs}
                disabled={filteredLogs.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-semibold">{stats.total}</div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Errors
                </div>
                <div className="font-semibold text-red-500">{stats.error}</div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                  Warnings
                </div>
                <div className="font-semibold text-yellow-500">{stats.warn}</div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  Info
                </div>
                <div className="font-semibold text-blue-500">{stats.info}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Log Area */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Live Logs</h2>
              <p className="text-muted-foreground">
                {filteredLogs.length} log entries • {isTailEnabled ? 'Following' : 'Paused'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={toggleTail}>
                {isTailEnabled ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={refreshLogs} disabled={loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>

          {/* Log Viewer */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={isTailEnabled}
                      onCheckedChange={toggleTail}
                    />
                    <span className="text-sm">Follow logs</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Auto-refresh: {filter.autoRefresh ? 'On' : 'Off'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {stats.error} errors
                  </Badge>
                  <Badge variant="outline">
                    {stats.warn} warnings
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <div className="h-full bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col">
                {/* Log Header */}
                <div className="border-b border-gray-700 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Timestamp</span>
                    <span>Level</span>
                    <span>Container</span>
                    <span>Message</span>
                  </div>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No logs found</p>
                      <p className="text-sm mt-2">Try adjusting your filters or refreshing</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="border-b border-gray-800 hover:bg-gray-900 p-3 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-gray-500 text-xs whitespace-nowrap min-w-[80px]">
                            {formatTime(log.timestamp)}
                          </span>
                          <span className={`text-xs font-semibold whitespace-nowrap min-w-[60px] ${getLevelColor(log.level)}`}>
                            {getLevelIcon(log.level)}
                            <span className="ml-1">{log.level.toUpperCase()}</span>
                          </span>
                          <span className="text-xs text-gray-400 whitespace-nowrap min-w-[100px]">
                            {log.container}
                          </span>
                          <span className="text-green-400 flex-1 break-all">
                            {log.message}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}