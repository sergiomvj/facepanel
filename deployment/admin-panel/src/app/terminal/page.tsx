'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Terminal, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Copy, 
  Download,
  Settings,
  Play,
  Square,
  Trash2,
  Monitor,
  Keyboard
} from 'lucide-react'

interface TerminalSession {
  id: string
  name: string
  container: string
  status: 'connected' | 'disconnected' | 'connecting'
  createdAt: Date
  lastActivity: Date
}

interface TerminalProps {
  sessionId: string
  container: string
  onDisconnect: () => void
  onResize: (cols: number, rows: number) => void
}

function TerminalComponent({ sessionId, container, onDisconnect, onResize }: TerminalProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Simulate terminal connection
    setIsConnected(true)
    setOutput([
      `Connected to container: ${container}`,
      `Session ID: ${sessionId}`,
      'Type "help" for available commands',
      ''
    ])

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }

    return () => {
      setIsConnected(false)
    }
  }, [sessionId, container])

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleCommand = (command: string) => {
    if (!command.trim()) return

    // Add command to output
    setOutput(prev => [...prev, `$ ${command}`])

    // Simulate command execution
    setTimeout(() => {
      let response = ''
      
      switch (command.toLowerCase()) {
        case 'help':
          response = `Available commands:
  help     - Show this help message
  ls       - List files and directories
  pwd      - Print working directory
  ps       - List running processes
  top      - Show system processes
  df -h    - Show disk usage
  free -h  - Show memory usage
  netstat  - Show network connections
  clear    - Clear terminal screen
  exit     - Disconnect from terminal`
          break
        case 'ls':
          response = `total 24
drwxr-xr-x  2 root root 4096 Jan 20 10:30 .
drwxr-xr-x  3 root root 4096 Jan 20 10:30 ..
-rw-r--r--  1 root root  220 Jan 20 10:30 .bash_logout
-rw-r--r--  1 root root 3771 Jan 20 10:30 .bashrc
-rw-r--r--  1 root root  807 Jan 20 10:30 .profile
drwxr-xr-x  2 root root 4096 Jan 20 10:30 app
-rw-r--r--  1 root root    0 Jan 20 10:30 index.js`
          break
        case 'pwd':
          response = '/app'
          break
        case 'ps':
          response = `PID   TTY      TIME     CMD
    1   pts/0    00:00:01 node
   15   pts/0    00:00:00 ps`
          break
        case 'df -h':
          response = `Filesystem      Size  Used Avail Use% Mounted on
overlay         100G   25G   75G  25% /
tmpfs           64M     0   64M   0% /dev
shm             64M     0   64M   0% /dev/shm`
          break
        case 'free -h':
          response = `              total        used        free      shared  buff/cache   available
Mem:          1.9Gi       128Mi       1.7Gi       1.0Mi       128Mi       1.7Gi
Swap:            0B          0B          0B`
          break
        case 'clear':
          setOutput([])
          setInput('')
          return
        case 'exit':
          onDisconnect()
          return
        default:
          response = `Command not found: ${command}. Type 'help' for available commands.`
      }

      setOutput(prev => [...prev, response, ''])
    }, 500)

    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    }
  }

  const copyOutput = () => {
    const text = output.join('\n')
    navigator.clipboard.writeText(text)
  }

  const downloadOutput = () => {
    const text = output.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terminal-${sessionId}-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg">{container}</CardTitle>
              <CardDescription>Terminal session</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={copyOutput}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadOutput}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDisconnect}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto whitespace-pre-wrap"
          style={{ minHeight: '400px' }}
        >
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          <div className="flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-transparent text-green-400 outline-none flex-1 font-mono"
              placeholder="Type command..."
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="border-t bg-muted/50 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Session: {sessionId}</span>
              <span>Container: {container}</span>
              <span>Size: 80x24</span>
            </div>
            <div className="flex items-center gap-2">
              <Keyboard className="w-3 h-3" />
              <span>Press Enter to execute</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TerminalPage() {
  const [sessions, setSessions] = useState<TerminalSession[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [selectedContainer, setSelectedContainer] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Mock containers data
  const containers = [
    'web-server',
    'api-server', 
    'database',
    'redis-cache',
    'nginx-proxy'
  ]

  const createNewSession = () => {
    if (!selectedContainer) return

    const newSession: TerminalSession = {
      id: `session-${Date.now()}`,
      name: `${selectedContainer}-${sessions.length + 1}`,
      container: selectedContainer,
      status: 'connecting',
      createdAt: new Date(),
      lastActivity: new Date()
    }

    setSessions(prev => [...prev, newSession])
    setActiveSession(newSession.id)
  }

  const disconnectSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'disconnected' as const }
        : session
    ))
    
    if (activeSession === sessionId) {
      setActiveSession(null)
    }
  }

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
    if (activeSession === sessionId) {
      setActiveSession(null)
    }
  }

  const clearDisconnected = () => {
    setSessions(prev => prev.filter(session => session.status !== 'disconnected'))
    if (activeSession && sessions.find(s => s.id === activeSession)?.status === 'disconnected') {
      setActiveSession(null)
    }
  }

  const activeSessionData = sessions.find(s => s.id === activeSession)

  if (isFullscreen && activeSessionData) {
    return (
      <div className="h-screen bg-background p-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Terminal - {activeSessionData.container}</h1>
            <Button variant="outline" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
          <TerminalComponent
            sessionId={activeSessionData.id}
            container={activeSessionData.container}
            onDisconnect={() => disconnectSession(activeSessionData.id)}
            onResize={(cols, rows) => console.log('Resize to:', cols, rows)}
          />
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
            <h1 className="text-2xl font-bold">Web Terminal</h1>
            <p className="text-sm text-muted-foreground">Access your containers</p>
          </div>

          {/* New Session */}
          <div className="p-4 border-b">
            <div className="space-y-3">
              <Label>Container</Label>
              <Select value={selectedContainer} onValueChange={setSelectedContainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map(container => (
                    <SelectItem key={container} value={container}>
                      {container}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={createNewSession} 
                disabled={!selectedContainer}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Active Sessions</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearDisconnected}
                disabled={!sessions.some(s => s.status === 'disconnected')}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active sessions</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <Card 
                    key={session.id}
                    className={`cursor-pointer transition-colors ${
                      activeSession === session.id ? 'ring-2 ring-primary' : ''
                    } ${session.status === 'disconnected' ? 'opacity-50' : ''}`}
                    onClick={() => session.status !== 'disconnected' && setActiveSession(session.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            <span className="font-medium text-sm">{session.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.container}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {session.createdAt.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={
                              session.status === 'connected' ? 'default' :
                              session.status === 'connecting' ? 'outline' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (session.status === 'disconnected') {
                                removeSession(session.id)
                              } else {
                                disconnectSession(session.id)
                              }
                            }}
                          >
                            {session.status === 'disconnected' ? 
                              <Trash2 className="w-3 h-3" /> : 
                              <Square className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Sessions</div>
                <div className="font-semibold">{sessions.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Connected</div>
                <div className="font-semibold">
                  {sessions.filter(s => s.status === 'connected').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Terminal Area */}
        <div className="flex-1 flex flex-col p-6">
          {activeSessionData ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{activeSessionData.container}</h2>
                  <p className="text-muted-foreground">Terminal session active</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsFullscreen(true)}>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Fullscreen
                  </Button>
                  <Button variant="outline" onClick={() => disconnectSession(activeSessionData.id)}>
                    <Square className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <TerminalComponent
                  sessionId={activeSessionData.id}
                  container={activeSessionData.container}
                  onDisconnect={() => disconnectSession(activeSessionData.id)}
                  onResize={(cols, rows) => console.log('Resize to:', cols, rows)}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Terminal className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Session</h3>
                <p className="text-muted-foreground mb-6">
                  Select a container and create a new terminal session
                </p>
                <div className="space-y-4 max-w-sm mx-auto">
                  <Select value={selectedContainer} onValueChange={setSelectedContainer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select container" />
                    </SelectTrigger>
                    <SelectContent>
                      {containers.map(container => (
                        <SelectItem key={container} value={container}>
                          {container}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={createNewSession} 
                    disabled={!selectedContainer}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Terminal Session
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}