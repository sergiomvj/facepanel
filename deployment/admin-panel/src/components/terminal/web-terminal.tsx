'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Terminal, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Download, 
  Upload,
  RefreshCw,
  Play,
  Square,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface TerminalSession {
  id: string
  name: string
  containerId: string
  containerName: string
  image: string
  status: 'connected' | 'disconnected' | 'connecting'
  createdAt: string
  lastActivity: string
}

interface WebTerminalProps {
  services?: Array<{
    id: string
    name: string
    containerId?: string
    image: string
    status: string
  }>
}

export function WebTerminal({ services = [] }: WebTerminalProps) {
  const [sessions, setSessions] = useState<TerminalSession[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isMaximized, setIsMaximized] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock containers data
  const containers = services.map(service => ({
    id: service.id,
    name: service.name,
    containerId: service.containerId || "container-" + service.id,
    image: service.image,
    status: service.status
  }))

  const connectToContainer = (containerId: string) => {
    setConnectionStatus('connecting')
    setSelectedContainer(containerId)
    
    // Simulate connection delay
    setTimeout(() => {
      const container = containers.find(c => c.id === containerId)
      if (container) {
        const newSession: TerminalSession = {
          id: Date.now().toString(),
          name: container.name,
          containerId: container.containerId,
          containerName: container.name,
          image: container.image,
          status: 'connected',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
        
        setSessions(prev => [...prev, newSession])
        setActiveSession(newSession.id)
        setConnectionStatus('connected')
        
        // Add welcome message
        setTerminalOutput([
          "Connected to container: " + container.name,
          "Image: " + container.image,
          "Container ID: " + container.containerId,
          '',
          'Welcome to Web Terminal!',
          'Type "help" for available commands.',
          ''
        ])
      }
    }, 1500)
  }

  const disconnectSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'disconnected' as const }
        : session
    ))
    
    if (activeSession === sessionId) {
      setActiveSession(null)
      setTerminalOutput([])
    }
  }

  const executeCommand = (command: string) => {
    if (!activeSession || connectionStatus !== 'connected') return

    const session = sessions.find(s => s.id === activeSession)
    if (!session) return

    // Add command to output
    setTerminalOutput(prev => [...prev, `$ ${command}'])

    // Simulate command execution
    setTimeout(() => {
      let output: string[] = []
      
      switch (command.trim()) {
        case 'help':
          output = [
            'Available commands:',
            '  help     - Show this help message',
            '  ls       - List files and directories',
            '  pwd      - Print working directory',
            '  ps       - List running processes',
            '  top      - Display system processes',
            '  df -h    - Show disk usage',
            '  free -h  - Show memory usage',
            '  netstat  - Show network connections',
            '  clear    - Clear terminal screen',
            '  exit     - Disconnect from container',
            ''
          ]
          break
        case 'ls':
          output = [
            'total 24',
            'drwxr-xr-x  2 root root 4096 Jan 15 10:30 app',
            'drwxr-xr-x  2 root root 4096 Jan 15 10:30 node_modules',
            '-rw-r--r--  1 root root  345 Jan 15 10:30 package.json',
            '-rw-r--r--  1 root root  567 Jan 15 10:30 server.js',
            '-rw-r--r--  1 root root   89 Jan 15 10:30 .env',
            ''
          ]
          break
        case 'pwd':
          output = ['/app', '']
          break
        case 'ps':
          output = [
            'PID   TTY      TIME     CMD',
            '1     ?        00:00:01 node',
            '15    ?        00:00:00 npm',
            '25    ?        00:00:00 sh',
            '31    pts/0    00:00:00 bash',
            ''
          ]
          break
        case 'df -h':
          output = [
            'Filesystem      Size  Used Avail Use% Mounted on',
            '/dev/sda1       20G   12G   7.2G  63% /',
            'tmpfs           1.9G     0  1.9G   0% /dev/shm',
            'tmpfs           1.9G  8.4M  1.9G   1% /run',
            ''
          ]
          break
        case 'free -h':
          output = [
            '              total        used        free      shared  buff/cache   available',
            'Mem:          7.7Gi       1.2Gi       5.8Gi       1.0MiB      6.1Gi       6.2Gi',
            'Swap:         2.0Gi          0B       2.0Gi',
            ''
          ]
          break
        case 'netstat':
          output = [
            'Active Internet connections (only servers)',
            'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
            'tcp        0      0 0.0.0.0:80             0.0.0.0:*               LISTEN',
            'tcp        0      0 0.0.0.0:443            0.0.0.0:*               LISTEN',
            'tcp        0      0 0.0.0.0:3000           0.0.0.0:*               LISTEN',
            ''
          ]
          break
        case 'clear':
          setTerminalOutput([])
          return
        case 'exit':
          disconnectSession(activeSession)
          return
        default:
          if (command.trim()) {
            const commandName = command.split(' ')[0]
            output = [
              "bash: " + commandName + ": command not found",
              'Type "help" for available commands.',
              ''
            ]
          }
      }
      
      setTerminalOutput(prev => [...prev, ...output])
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      executeCommand(terminalInput)
      setTerminalInput('')
    }
  }

  const copyOutput = () => {
    const text = terminalOutput.join('\n')
    navigator.clipboard.writeText(text)
  }

  const downloadOutput = () => {
    const text = terminalOutput.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "terminal-" + new Date().toISOString() + ".txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const reconnect = () => {
    if (selectedContainer) {
      connectToContainer(selectedContainer)
    }
  }

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  // Focus input when terminal is active
  useEffect(() => {
    if (activeSession && connectionStatus === 'connected' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeSession, connectionStatus])

  const getStatusIcon = (status: TerminalSession['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Terminal Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Terminal Sessions
          </CardTitle>
          <CardDescription>
            Connect to containers and execute commands via web terminal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card 
                key={session.id}
                className={
                  "cursor-pointer transition-colors " +
                  (activeSession === session.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50')
                }
                onClick={() => setActiveSession(session.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{session.name}</CardTitle>
                    {getStatusIcon(session.status)}
                  </div>
                  <CardDescription className="text-xs">
                    {session.containerName} • {session.image.split(':')[0]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(session.createdAt).toLocaleTimeString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        disconnectSession(session.id)
                      }}
                    >
                      <Square className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terminal Interface */}
      <Card className={isMaximized ? 'fixed inset-0 z-50 m-0' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <div>
              <CardTitle>Web Terminal</CardTitle>
              <CardDescription>
                {activeSession 
                  ? "Connected to " + (sessions.find(s => s.id === activeSession)?.containerName || 'Unknown')
                  : 'Select a container to connect'
                }
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeSession && (
              <>
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                  {connectionStatus}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyOutput}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadOutput}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearTerminal}>
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={reconnect}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            )}
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
          {!activeSession ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Terminal className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Terminal Session</h3>
                <p className="text-muted-foreground mb-4">
                  Select a container below to start a terminal session
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="container-select">Select Container</Label>
                <Select value={selectedContainer} onValueChange={connectToContainer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a container to connect" />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={container.status === 'running' ? 'default' : 'secondary'}>
                            {container.status}
                          </Badge>
                          <span>{container.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ({container.image.split(':')[0]})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {connectionStatus === 'connecting' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to container...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Terminal Output */}
              <div 
                ref={terminalRef}
                className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap"
                onClick={() => inputRef.current?.focus()}
              >
                {terminalOutput.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
                {connectionStatus === 'connected' && (
                  <div className="flex items-center">
                    <span className="text-green-400">$ </span>
                    <Input
                      ref={inputRef}
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-none text-green-400 font-mono text-sm focus:outline-none focus:ring-0 p-0 h-auto"
                      placeholder="Type command..."
                    />
                  </div>
                )}
              </div>
              
              {/* Terminal Controls */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Press Enter to execute command</span>
                  <span>•</span>
                  <span>Type "help" for available commands</span>
                  <span>•</span>
                  <span>Type "clear" to clear screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows: {terminalOutput.length}</span>
                  <span>•</span>
                  <span>Connected: {sessions.find(s => s.id === activeSession)?.containerName}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Containers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Containers</CardTitle>
          <CardDescription>
            Running containers that you can connect to with the terminal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((container) => (
              <Card key={container.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{container.name}</CardTitle>
                    <Badge variant={container.status === 'running' ? 'default' : 'secondary'}>
                      {container.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {container.image}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      ID: {container.containerId}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connectToContainer(container.id)}
                      disabled={connectionStatus === 'connecting' || sessions.some(s => s.containerId === container.containerId && s.status === 'connected')}
                    >
                      {sessions.some(s => s.containerId === container.containerId && s.status === 'connected') ? (
                        'Connected'
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
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