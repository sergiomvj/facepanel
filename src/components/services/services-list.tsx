'use client'

import { useState } from 'react'
import { useServices } from '@/hooks/use-services'
import { ServiceCard } from './service-card'
import { CreateServiceDialog } from './create-service-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Search, Filter, Plus, Activity, Database, Globe, Zap } from 'lucide-react'

export function ServicesList() {
  const { 
    services, 
    blueprints, 
    loading, 
    error, 
    createService, 
    updateService,
    startService, 
    stopService, 
    restartService, 
    deleteService,
    createServiceFromBlueprint
  } = useServices()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped' | 'creating' | 'restarting' | 'error'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [editingService, setEditingService] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.image.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateService = async (serviceData: any) => {
    if (serviceData.blueprintId) {
      await createServiceFromBlueprint(serviceData.blueprintId, serviceData)
    } else {
      await createService(serviceData)
    }
  }

  const handleEditService = async (serviceData: any) => {
    try {
      await updateService(editingService.id, serviceData)
      setEditDialogOpen(false)
      setEditingService(null)
    } catch (error) {
      console.error('Failed to update service:', error)
    }
  }

  const openEditDialog = (service: any) => {
    setEditingService(service)
    setEditDialogOpen(true)
  }

  const getStatusCounts = () => {
    return {
      total: services.length,
      running: services.filter(s => s.status === 'running').length,
      stopped: services.filter(s => s.status === 'stopped').length,
      creating: services.filter(s => s.status === 'creating').length,
      restarting: services.filter(s => s.status === 'restarting').length,
      error: services.filter(s => s.status === 'error').length
    }
  }

  const statusCounts = getStatusCounts()

  const getResourceUsage = () => {
    const runningServices = services.filter(s => s.status === 'running')
    return {
      totalCpu: runningServices.reduce((sum, s) => sum + s.cpu, 0),
      totalMemory: runningServices.reduce((sum, s) => sum + s.memory, 0),
      totalPorts: services.reduce((sum, s) => sum + s.ports.length, 0),
      totalVolumes: services.reduce((sum, s) => sum + s.volumes.length, 0)
    }
  }

  const resourceUsage = getResourceUsage()

  if (loading && services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Services</h2>
            <p className="text-muted-foreground">Manage your containerized services</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-muted-foreground">Manage your containerized services</p>
        </div>
        <CreateServiceDialog onCreateService={handleCreateService}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Button>
        </CreateServiceDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.running}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(resourceUsage.totalCpu)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(resourceUsage.totalMemory / 1024)}GB</div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resource Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Ports:</span>
              <span className="font-medium">{resourceUsage.totalPorts}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Volumes:</span>
              <span className="font-medium">{resourceUsage.totalVolumes}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Networks:</span>
              <span className="font-medium">
                {Array.from(new Set(services.flatMap(s => s.networks))).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg CPU/Service:</span>
              <span className="font-medium">
                {statusCounts.running > 0 ? Math.round(resourceUsage.totalCpu / statusCounts.running) : '0'}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
                <SelectItem value="creating">Creating</SelectItem>
                <SelectItem value="restarting">Restarting</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                <Filter className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first service.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <CreateServiceDialog onCreateService={handleCreateService}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
                </CreateServiceDialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onStart={startService}
              onStop={stopService}
              onRestart={restartService}
              onDelete={deleteService}
              onEdit={openEditDialog}
            />
          ))}
        </div>
      )}

      {/* Available Blueprints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Blueprints ({blueprints.length})</CardTitle>
          <CardDescription>Quickly create services from pre-configured templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueprints.slice(0, 6).map((blueprint) => (
              <Card key={blueprint.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {blueprint.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {blueprint.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {blueprint.category}
                    </Badge>
                    <CreateServiceDialog onCreateService={handleCreateService}>
                      <Button size="sm" variant="outline">
                        Use
                      </Button>
                    </CreateServiceDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Service Dialog */}
      <CreateServiceDialog 
        onCreateService={handleEditService}
        editingService={editingService}
      >
        <div style={{ display: 'none' }}>Edit Dialog Trigger</div>
      </CreateServiceDialog>
    </div>
  )
}