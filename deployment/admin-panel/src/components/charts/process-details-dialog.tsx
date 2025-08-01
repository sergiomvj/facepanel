'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Activity, 
  Database, 
  HardDrive, 
  Wifi, 
  Search,
  ArrowUpDown,
  Cpu,
  MemoryStick,
  Network
} from 'lucide-react'

interface Process {
  pid: number
  name: string
  user: string
  cpu: number
  memory: number
  status: 'running' | 'sleeping' | 'stopped' | 'zombie'
  startTime: string
  command: string
}

interface Connection {
  id: string
  localAddress: string
  remoteAddress: string
  protocol: 'TCP' | 'UDP'
  state: 'ESTABLISHED' | 'LISTENING' | 'TIME_WAIT' | 'CLOSE_WAIT'
  process: string
  pid: number
}

interface ProcessDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'cpu' | 'memory' | 'disk' | 'network'
  title: string
}

export function ProcessDetailsDialog({
  open,
  onOpenChange,
  type,
  title
}: ProcessDetailsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid'>('cpu')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState<'processes' | 'connections'>('processes')

  // Mock data - in a real implementation, this would come from system APIs
  const mockProcesses: Process[] = [
    {
      pid: 1,
      name: 'systemd',
      user: 'root',
      cpu: 0.1,
      memory: 2.5,
      status: 'running',
      startTime: '2024-01-01 00:00:00',
      command: '/sbin/init'
    },
    {
      pid: 1234,
      name: 'node',
      user: 'appuser',
      cpu: 45.2,
      memory: 512.3,
      status: 'running',
      startTime: '2024-01-20 10:30:00',
      command: 'node server.js'
    },
    {
      pid: 5678,
      name: 'nginx',
      user: 'www-data',
      cpu: 12.8,
      memory: 128.7,
      status: 'running',
      startTime: '2024-01-20 10:31:00',
      command: 'nginx: master process'
    },
    {
      pid: 9012,
      name: 'postgres',
      user: 'postgres',
      cpu: 8.5,
      memory: 1024.5,
      status: 'running',
      startTime: '2024-01-20 10:32:00',
      command: 'postgres -D /var/lib/postgresql'
    },
    {
      pid: 3456,
      name: 'redis-server',
      user: 'redis',
      cpu: 3.2,
      memory: 64.2,
      status: 'running',
      startTime: '2024-01-20 10:33:00',
      command: 'redis-server *:6379'
    }
  ]

  const mockConnections: Connection[] = [
    {
      id: '1',
      localAddress: '0.0.0.0:80',
      remoteAddress: '192.168.1.100:54321',
      protocol: 'TCP',
      state: 'ESTABLISHED',
      process: 'nginx',
      pid: 5678
    },
    {
      id: '2',
      localAddress: '0.0.0.0:443',
      remoteAddress: '192.168.1.101:12345',
      protocol: 'TCP',
      state: 'ESTABLISHED',
      process: 'nginx',
      pid: 5678
    },
    {
      id: '3',
      localAddress: '127.0.0.1:5432',
      remoteAddress: '127.0.0.1:54320',
      protocol: 'TCP',
      state: 'ESTABLISHED',
      process: 'postgres',
      pid: 9012
    },
    {
      id: '4',
      localAddress: '0.0.0.0:6379',
      remoteAddress: '192.168.1.102:54322',
      protocol: 'TCP',
      state: 'ESTABLISHED',
      process: 'redis-server',
      pid: 3456
    },
    {
      id: '5',
      localAddress: '0.0.0.0:3000',
      remoteAddress: '192.168.1.103:54323',
      protocol: 'TCP',
      state: 'LISTENING',
      process: 'node',
      pid: 1234
    }
  ]

  const filteredProcesses = mockProcesses
    .filter(process => 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.command.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'cpu':
          return (a.cpu - b.cpu) * modifier
        case 'memory':
          return (a.memory - b.memory) * modifier
        case 'name':
          return a.name.localeCompare(b.name) * modifier
        case 'pid':
          return (a.pid - b.pid) * modifier
        default:
          return 0
      }
    })

  const filteredConnections = mockConnections
    .filter(connection => 
      connection.localAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.remoteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.process.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'ESTABLISHED':
      case 'LISTENING':
        return 'default'
      case 'sleeping':
        return 'secondary'
      case 'stopped':
        return 'destructive'
      case 'zombie':
      case 'TIME_WAIT':
      case 'CLOSE_WAIT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'cpu':
        return <Cpu className="h-5 w-5" />
      case 'memory':
        return <MemoryStick className="h-5 w-5" />
      case 'disk':
        return <HardDrive className="h-5 w-5" />
      case 'network':
        return <Network className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="6xl">
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title} - Detailed Information
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search and Controls */}
          <div className="flex items-center gap-4 p-4 border-b">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search processes or connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {activeTab === 'processes' && (
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpu">CPU</SelectItem>
                    <SelectItem value="memory">Memory</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="pid">PID</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <Button
              variant={activeTab === 'processes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('processes')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Processes ({filteredProcesses.length})
            </Button>
            <Button
              variant={activeTab === 'connections' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('connections')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Network Connections ({filteredConnections.length})
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'processes' ? (
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>CPU %</TableHead>
                      <TableHead>Memory MB</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Command</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcesses.map((process) => (
                      <TableRow key={process.pid}>
                        <TableCell className="font-mono">{process.pid}</TableCell>
                        <TableCell className="font-medium">{process.name}</TableCell>
                        <TableCell>{process.user}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min(process.cpu, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{Math.round(process.cpu)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min(process.memory / 1024 * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{Math.round(process.memory)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(process.status)}>
                            {process.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {process.command}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local Address</TableHead>
                      <TableHead>Remote Address</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Process</TableHead>
                      <TableHead>PID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConnections.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-mono">{connection.localAddress}</TableCell>
                        <TableCell className="font-mono">{connection.remoteAddress}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{connection.protocol}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(connection.state)}>
                            {connection.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{connection.process}</TableCell>
                        <TableCell className="font-mono">{connection.pid}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="border-t p-4 bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {activeTab === 'processes' ? (
                <>
                  <div>
                    <div className="text-muted-foreground">Total Processes</div>
                    <div className="font-semibold">{filteredProcesses.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total CPU Usage</div>
                    <div className="font-semibold">
                      {Math.round(filteredProcesses.reduce((sum, p) => sum + p.cpu, 0))}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Memory</div>
                    <div className="font-semibold">
                      {Math.round(filteredProcesses.reduce((sum, p) => sum + p.memory, 0))} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Running</div>
                    <div className="font-semibold">
                      {filteredProcesses.filter(p => p.status === 'running').length}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-muted-foreground">Total Connections</div>
                    <div className="font-semibold">{filteredConnections.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">TCP Connections</div>
                    <div className="font-semibold">
                      {filteredConnections.filter(c => c.protocol === 'TCP').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Established</div>
                    <div className="font-semibold">
                      {filteredConnections.filter(c => c.state === 'ESTABLISHED').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Listening</div>
                    <div className="font-semibold">
                      {filteredConnections.filter(c => c.state === 'LISTENING').length}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}