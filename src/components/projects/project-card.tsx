'use client'

import { Project } from '@/hooks/use-projects'
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
  FolderOpen,
  Activity,
  Database,
  Globe
} from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
}

export function ProjectCard({ 
  project, 
  onStart, 
  onStop, 
  onRestart, 
  onDelete, 
  onEdit 
}: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'running':
        return 'default'
      case 'stopped':
        return 'secondary'
      case 'creating':
        return 'outline'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getEnvironmentColor = (environment: Project['environment']) => {
    switch (environment) {
      case 'production':
        return 'destructive'
      case 'staging':
        return 'default'
      case 'development':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2 text-sm">
              {project.description || 'No description'}
            </CardDescription>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant={getEnvironmentColor(project.environment)}>
                {project.environment}
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
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStart(project.id)} disabled={project.status === 'running'}>
                <Play className="w-4 h-4 mr-2" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStop(project.id)} disabled={project.status === 'stopped'}>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRestart(project.id)} disabled={project.status !== 'running'}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.id)}
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
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CPU</span>
            </div>
            <span className="font-semibold text-sm">{project.cpu}%</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">RAM</span>
            </div>
            <span className="font-semibold text-sm">{project.memory}MB</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Disk</span>
            </div>
            <span className="font-semibold text-sm">{project.disk}MB</span>
          </div>
        </div>

        {/* Services and Domain */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {project.services} {project.services === 1 ? 'service' : 'services'}
            </span>
          </div>
          {project.domain && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span className="truncate">{project.domain}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onStart(project.id)}
            disabled={project.status === 'running'}
          >
            <Play className="w-3 h-3 mr-1" />
            Start
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onStop(project.id)}
            disabled={project.status === 'stopped'}
          >
            <Pause className="w-3 h-3 mr-1" />
            Stop
          </Button>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}