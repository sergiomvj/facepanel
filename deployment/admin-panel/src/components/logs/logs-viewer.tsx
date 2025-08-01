'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Pause, 
  Play,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source: string
  containerId: string
  containerName: string
}

interface LogsViewerProps {
  services?: Array<{
    id: string
    name: string
    containerId?: string
    image: string
    status: string
  }>
}

export function LogsViewer({ services = [] }: LogsViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [selectedContainer, setSelectedContainer] = useState<string>('all')
  const [logLevel, setLogLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [followLogs, setFollowLogs] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mock log data generation
  const generateMockLog = (containerId: string, containerName: string): LogEntry => {
    const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug']
    const messages = [
      'Application started successfully',
      'Database connection established',
      'Processing user request',
      'Cache miss for key',
      'Background job completed',
      'Health check passed',
      'Configuration loaded',
      'Service registered',
      'Request processed in 45ms',
      'Memory usage: 128MB',
      'CPU usage: 2.1%',
      'Network request to external API',
      'User authentication successful',
      'File uploaded successfully',
      'Email sent to user',
      'Cache cleared successfully',
      'Warning: High memory usage detected',
      'Error: Database connection timeout',
      'Debug: Query execution time: 15ms'
    ]

    const sources = ['app', 'nginx', 'database', 'cache', 'worker', 'api', 'web']
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      containerId,
      containerName
    }
  }

  // Initialize logs
  useEffect(() => {
    const initialLogs: LogEntry[] = []
    services.forEach(service => {
      for (let i = 0; i < 10; i++) {
        initialLogs.push(generateMockLog(service.id || `container-${service.id}`, service.name))
      }
    })
    setLogs(initialLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
  }, [services])

  // Auto-refresh logs
  useEffect(() => {
    if (!isAutoRefresh || isPaused) return

    const interval = setInterval(() => {
      if (services.length > 0) {
        const randomService = services[Math.floor(Math.random() * services.length)]
        const newLog = generateMockLog(randomService.id || `container-${randomService.id}`, randomService.name)
        setLogs(prev => [...prev, newLog])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isAutoRefresh, isPaused, services])

  // Filter logs
  useEffect(() => {
    let filtered = logs

    if (selectedContainer !== 'all') {
      filtered = filtered.filter(log => log.containerId === selectedContainer)
    }

    if (logLevel !== 'all') {
      filtered = filtered.filter(log => log.level === logLevel)
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }, [logs, selectedContainer, logLevel, searchTerm])

  // Auto-scroll to bottom
  useEffect(() => {
    if (followLogs && logsEndRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [filteredLogs, followLogs])

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />
      case 'debug':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600'
      case 'warn':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      case 'debug':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n')
    
    navigator.clipboard.writeText(logText)
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10
      setFollowLogs(isAtBottom)
    }
  }

  const levelCounts = {
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    debug: logs.filter(l => l.level === 'debug').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{levelCounts.error}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{levelCounts.warn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{levelCounts.info}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debug</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{levelCounts.debug}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Viewer */}
      <Card className={isMaximized ? 'fixed inset-0 z-50 m-0' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <div>
              <CardTitle>Container Logs</CardTitle>
              <CardDescription>
                Real-time log streaming from your containers
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={isAutoRefresh}
                onCheckedChange={setIsAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={copyLogs}>
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={downloadLogs}>
              <Download className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedContainer} onValueChange={setSelectedContainer}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Containers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Containers</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id || `container-${service.id}`}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Showing {filteredLogs.length} of {logs.length} logs</span>
                {isPaused && (
                  <Badge variant="secondary">Paused</Badge>
                )}
                {!isAutoRefresh && (
                  <Badge variant="secondary">Auto Refresh Disabled</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={followLogs}
                  onCheckedChange={setFollowLogs}
                />
                <Label htmlFor="follow-logs" className="text-sm">Follow Logs</Label>
              </div>
            </div>
            
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto"
            >
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No logs found. Try adjusting your filters.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 hover:bg-gray-900 p-1 rounded">
                      <div className="flex-shrink-0 pt-0.5">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">{formatTimestamp(log.timestamp)}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.containerName}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getLevelColor(log.level)}`}
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-green-400 break-all">{log.message}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Status */}
      <Card>
        <CardHeader>
          <CardTitle>Container Status</CardTitle>
          <CardDescription>
            Status of all containers and their log availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                    <Badge variant={service.status === 'running' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {service.image}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Container ID: {service.containerId || `container-${service.id}`}</span>
                    <Badge variant="outline" className="text-xs">
                      {logs.filter(l => l.containerId === (service.id || `container-${service.id}`)).length} logs
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}