'use client'

import { Service } from '@/hooks/use-services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Settings,
  Activity,
  Database,
  HardDrive,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface ServiceCardProps {
  service: Service
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (service: Service) => void
}

export function ServiceCard({ 
  service, 
  onStart, 
  onStop, 
  onRestart, 
  onDelete, 
  onEdit 
}: ServiceCardProps) {
  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running':
        return 'default'
      case 'stopped':
        return 'secondary'
      case 'creating':
      case 'restarting':
        return 'outline'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'stopped':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'creating':
      case 'restarting':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getImageName = (image: string) => {
    const parts = image.split(':')
    return parts[0].split('/').pop()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {service.description || 'No description'}
            </CardDescription>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusColor(service.status)}>
                {service.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getImageName(service.image)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStart(service.id)} disabled={service.status === 'running'}>
                <Play className="w-4 h-4 mr-2" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStop(service.id)} disabled={service.status === 'stopped'}>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRestart(service.id)} disabled={service.status !== 'running'}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(service.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ports */}
        {service.ports.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Globe className="w-3 h-3" />
              Ports
            </div>
            <div className="flex flex-wrap gap-1">
              {service.ports.map((port, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {port}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Networks */}
        {service.networks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Zap className="w-3 h-3" />
              Networks
            </div>
            <div className="flex flex-wrap gap-1">
              {service.networks.map((network, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {network}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">CPU:</span>
            <span className="font-medium">{Math.round(service.cpu)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">RAM:</span>
            <span className="font-medium">{service.memory.toFixed(0)}MB</span>
          </div>
        </div>

        {/* Health Check */}
        {service.healthCheck.enabled && (
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Health check enabled</span>
          </div>
        )}

        {/* Volumes */}
        {service.volumes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <HardDrive className="w-3 h-3" />
              Volumes ({service.volumes.length})
            </div>
            <div className="text-xs text-muted-foreground">
              {service.volumes.slice(0, 2).map((volume, index) => (
                <div key={index} className="truncate">
                  {volume.split(':')[0]}
                </div>
              ))}
              {service.volumes.length > 2 && (
                <div className="text-muted-foreground">
                  +{service.volumes.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {formatDate(service.createdAt)}</span>
          <span>Updated: {formatDate(service.updatedAt)}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onStart(service.id)}
            disabled={service.status === 'running' || service.status === 'creating'}
          >
            <Play className="w-3 h-3 mr-1" />
            Start
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onStop(service.id)}
            disabled={service.status === 'stopped'}
          >
            <Pause className="w-3 h-3 mr-1" />
            Stop
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onRestart(service.id)}
            disabled={service.status !== 'running'}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}