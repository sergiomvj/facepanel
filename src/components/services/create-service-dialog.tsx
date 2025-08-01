'use client'

import { useState } from 'react'
import { ServiceBlueprint, useServices } from '@/hooks/use-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Settings, 
  Database, 
  Globe, 
  Zap, 
  Trash2,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface CreateServiceDialogProps {
  onCreateService: (serviceData: any) => Promise<void>
  children: React.ReactNode
  editingService?: any
}

export function CreateServiceDialog({ onCreateService, children, editingService }: CreateServiceDialogProps) {
  const { blueprints } = useServices()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedBlueprint, setSelectedBlueprint] = useState<ServiceBlueprint | null>(null)
  const [activeTab, setActiveTab] = useState('blueprint')
  const isEditMode = !!editingService

  const [customService, setCustomService] = useState({
    name: editingService?.name || '',
    description: editingService?.description || '',
    image: editingService?.image || '',
    ports: editingService?.ports || [],
    environment: editingService?.environment || [],
    volumes: editingService?.volumes || [],
    networks: editingService?.networks || ['default'],
    restartPolicy: editingService?.restartPolicy || 'unless-stopped'
  })

  const [blueprintConfig, setBlueprintConfig] = useState({
    name: '',
    environment: {} as Record<string, string>,
    ports: [] as string[],
    volumes: [] as string[],
    networks: [] as string[]
  })

  const [newPort, setNewPort] = useState('')
  const [newVolume, setNewVolume] = useState('')
  const [newNetwork, setNewNetwork] = useState('')

  const handleCreateCustomService = async () => {
    if (!customService.name.trim() || !customService.image.trim()) return

    setLoading(true)
    try {
      await onCreateService(customService)
      if (!isEditMode) {
        setCustomService({
          name: '',
          description: '',
          image: '',
          ports: [],
          environment: [],
          volumes: [],
          networks: ['default'],
          restartPolicy: 'unless-stopped'
        })
        setOpen(false)
      }
    } catch (error) {
      console.error('Failed to create service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFromBlueprint = async () => {
    if (!selectedBlueprint || !blueprintConfig.name.trim()) return

    setLoading(true)
    try {
      await onCreateService({
        name: blueprintConfig.name,
        blueprintId: selectedBlueprint.id,
        environment: blueprintConfig.environment,
        ports: blueprintConfig.ports,
        volumes: blueprintConfig.volumes,
        networks: blueprintConfig.networks
      })
      setBlueprintConfig({
        name: '',
        environment: {},
        ports: [],
        volumes: [],
        networks: []
      })
      setSelectedBlueprint(null)
      setOpen(false)
    } catch (error) {
      console.error('Failed to create service:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPort = () => {
    if (newPort.trim() && !customService.ports.includes(newPort.trim())) {
      setCustomService(prev => ({
        ...prev,
        ports: [...prev.ports, newPort.trim()]
      }))
      setNewPort('')
    }
  }

  const removePort = (port: string) => {
    setCustomService(prev => ({
      ...prev,
      ports: prev.ports.filter(p => p !== port)
    }))
  }

  const addVolume = () => {
    if (newVolume.trim() && !customService.volumes.includes(newVolume.trim())) {
      setCustomService(prev => ({
        ...prev,
        volumes: [...prev.volumes, newVolume.trim()]
      }))
      setNewVolume('')
    }
  }

  const removeVolume = (volume: string) => {
    setCustomService(prev => ({
      ...prev,
      volumes: prev.volumes.filter(v => v !== volume)
    }))
  }

  const addNetwork = () => {
    if (newNetwork.trim() && !customService.networks.includes(newNetwork.trim())) {
      setCustomService(prev => ({
        ...prev,
        networks: [...prev.networks, newNetwork.trim()]
      }))
      setNewNetwork('')
    }
  }

  const removeNetwork = (network: string) => {
    setCustomService(prev => ({
      ...prev,
      networks: prev.networks.filter(n => n !== network)
    }))
  }

  const selectBlueprint = (blueprint: ServiceBlueprint) => {
    setSelectedBlueprint(blueprint)
    setBlueprintConfig(prev => ({
      ...prev,
      environment: blueprint.environment.reduce((acc, env) => ({
        ...acc,
        [env.name]: env.default
      }), {}),
      ports: blueprint.ports,
      networks: blueprint.networks
    }))
  }

  const blueprintCategories = Array.from(new Set(blueprints.map(b => b.category)))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Service' : 'Create New Service'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modify service configuration and settings'
              : 'Create a new container service from blueprint or custom configuration'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          {!isEditMode && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blueprint">From Blueprint</TabsTrigger>
              <TabsTrigger value="custom">Custom Service</TabsTrigger>
            </TabsList>
          )}
          {isEditMode && (
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="custom">Service Configuration</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="blueprint" className="space-y-4">
            {selectedBlueprint ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      {selectedBlueprint.name}
                    </CardTitle>
                    <CardDescription>{selectedBlueprint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Image</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          {selectedBlueprint.image}
                        </p>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Badge variant="outline">{selectedBlueprint.category}</Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Service Name *</Label>
                      <Input
                        placeholder="my-service"
                        value={blueprintConfig.name}
                        onChange={(e) => setBlueprintConfig(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    {selectedBlueprint.environment.length > 0 && (
                      <div>
                        <Label>Environment Variables</Label>
                        <div className="space-y-2 mt-2">
                          {selectedBlueprint.environment.map((env) => (
                            <div key={env.name} className="flex items-center gap-2">
                              <div className="flex-1">
                                <Label className="text-sm">{env.name}</Label>
                                <p className="text-xs text-muted-foreground">{env.description}</p>
                              </div>
                              <Input
                                placeholder={env.default}
                                value={blueprintConfig.environment[env.name] || ''}
                                onChange={(e) => setBlueprintConfig(prev => ({
                                  ...prev,
                                  environment: {
                                    ...prev.environment,
                                    [env.name]: e.target.value
                                  }
                                }))}
                                className="w-32"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setSelectedBlueprint(null)}>
                        ← Back to Blueprints
                      </Button>
                      <Button 
                        onClick={handleCreateFromBlueprint}
                        disabled={loading || !blueprintConfig.name.trim()}
                        className="flex-1"
                      >
                        {loading ? 'Creating...' : 'Create Service'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {blueprintCategories.map(category => (
                    <div key={category}>
                      <h3 className="font-medium mb-2 capitalize">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {blueprints
                          .filter(b => b.category === category)
                          .map(blueprint => (
                            <Card 
                              key={blueprint.id} 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => selectBlueprint(blueprint)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  {blueprint.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {blueprint.description}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {blueprint.image.split(':')[0].split('/').pop()}
                                  </Badge>
                                  {blueprint.healthCheck.enabled && (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    placeholder="my-service"
                    value={customService.name}
                    onChange={(e) => setCustomService(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your service"
                    value={customService.description}
                    onChange={(e) => setCustomService(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Docker Image *</Label>
                  <Input
                    id="image"
                    placeholder="nginx:latest"
                    value={customService.image}
                    onChange={(e) => setCustomService(prev => ({ ...prev, image: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label>Restart Policy</Label>
                  <Select 
                    value={customService.restartPolicy} 
                    onValueChange={(value) => setCustomService(prev => ({ ...prev, restartPolicy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="on-failure">On Failure</SelectItem>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="unless-stopped">Unless Stopped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Ports</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="80:80"
                      value={newPort}
                      onChange={(e) => setNewPort(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPort()}
                    />
                    <Button type="button" size="sm" onClick={addPort}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {customService.ports.map((port, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {port}
                        <button
                          type="button"
                          onClick={() => removePort(port)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Volumes</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="/host/path:/container/path"
                      value={newVolume}
                      onChange={(e) => setNewVolume(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addVolume()}
                    />
                    <Button type="button" size="sm" onClick={addVolume}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {customService.volumes.map((volume, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {volume.split(':')[0]}
                        <button
                          type="button"
                          onClick={() => removeVolume(volume)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Networks</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="network-name"
                      value={newNetwork}
                      onChange={(e) => setNewNetwork(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNetwork()}
                    />
                    <Button type="button" size="sm" onClick={addNetwork}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {customService.networks.map((network, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {network}
                        <button
                          type="button"
                          onClick={() => removeNetwork(network)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateCustomService}
                disabled={loading || !customService.name.trim() || !customService.image.trim()}
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Service' : 'Create Service')}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}