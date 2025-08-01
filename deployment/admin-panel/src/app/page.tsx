'use client'

import { useState } from 'react'
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMetrics } from '@/hooks/use-metrics'
import { useMetricsHistory } from '@/hooks/use-metrics-history'
import { ProjectsList } from '@/components/projects/projects-list'
import { ServicesList } from '@/components/services/services-list'
import { MetricChart } from '@/components/charts/metric-chart'
import { ProcessDetailsDialog } from '@/components/charts/process-details-dialog'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Activity, 
  Globe, 
  Terminal, 
  Database,
  Menu,
  Bell,
  User,
  AlertCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi
} from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const { metrics, loading, error } = useMetrics(3000) // Refresh every 3 seconds
  const { metrics: history, loading: historyLoading } = useMetricsHistory(5000, 60)
  
  // Process details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsType, setDetailsType] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu')
  const [detailsTitle, setDetailsTitle] = useState('')

  const showDetails = (type: 'cpu' | 'memory' | 'disk' | 'network', title: string) => {
    setDetailsType(type)
    setDetailsTitle(title)
    setDetailsDialogOpen(true)
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'services', icon: Activity, label: 'Services' },
    { id: 'terminal', icon: Terminal, label: 'Terminal' },
    { id: 'logs', icon: Database, label: 'Logs' },
    { id: 'domains', icon: Globe, label: 'Domains' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const recentProjects = [
    { name: 'Next.js Blog', status: 'running', services: 3, cpu: 2.1, memory: 512 },
    { name: 'E-commerce API', status: 'running', services: 2, cpu: 1.8, memory: 256 },
    { name: 'Analytics Dashboard', status: 'stopped', services: 4, cpu: 0, memory: 0 },
  ]

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {historyLoading ? (
          <>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </>
        ) : (
          <>
            <MetricChart
              title="CPU Usage"
              data={history.cpu}
              icon={Cpu}
              unit="%"
              color="#3b82f6"
              type="line"
              maxValue={100}
              showDetails={true}
              onShowDetails={() => showDetails('cpu', 'CPU Usage')}
            />
            
            <MetricChart
              title="Memory Usage"
              data={history.memory}
              icon={MemoryStick}
              unit="%"
              color="#10b981"
              type="area"
              maxValue={100}
              showDetails={true}
              onShowDetails={() => showDetails('memory', 'Memory Usage')}
            />
            
            <MetricChart
              title="Disk Space"
              data={history.disk}
              icon={HardDrive}
              unit="%"
              color="#f59e0b"
              type="line"
              maxValue={100}
              showDetails={true}
              onShowDetails={() => showDetails('disk', 'Disk Space')}
            />
            
            <MetricChart
              title="Network Traffic"
              data={history.network.download}
              icon={Wifi}
              unit="MB/s"
              color="#8b5cf6"
              type="area"
              maxValue={50}
              showDetails={true}
              onShowDetails={() => showDetails('network', 'Network Traffic')}
            />
          </>
        )}
      </div>

      {/* System Information */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  System Uptime
                </h4>
                <p className="text-2xl font-bold">{formatUptime(metrics.system.uptime)}</p>
                <p className="text-sm text-muted-foreground">
                  Since {new Date(Date.now() - metrics.system.uptime * 1000).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Load Average
                </h4>
                <div className="space-y-1">
                  {metrics.system.loadAverage.map((load, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {index === 0 ? '1min' : index === 1 ? '5min' : '15min'}
                      </span>
                      <span className="font-mono text-sm">{load.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MemoryStick className="w-4 h-4" />
                  Processes
                </h4>
                <p className="text-2xl font-bold">{metrics.system.processes}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">Active</Badge>
                  <Badge variant="secondary">Sleeping</Badge>
                  <Badge variant="destructive">Stopped</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your latest containerized applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={project.status === 'running' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {project.services} {project.services === 1 ? 'service' : 'services'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">CPU:</span> {project.cpu}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">RAM:</span> {project.memory}MB
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" onClick={() => setCurrentView('projects')}>
              <FolderOpen className="w-6 h-6" />
              <span>New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView('services')}>
              <Activity className="w-6 h-6" />
              <span>Add Service</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView('terminal')}>
              <Terminal className="w-6 h-6" />
              <span>Terminal</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView('domains')}>
              <Globe className="w-6 h-6" />
              <span>Add Domain</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectsList />
      case 'services':
        return <ServicesList />
      case 'terminal':
        window.location.href = '/terminal'
      case 'logs':
        window.location.href = '/logs'
      case 'domains':
        window.location.href = '/domains'
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure PanelX settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings</h3>
                <p className="text-muted-foreground">This feature is coming soon!</p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return renderDashboard()
    }
  }

  const getViewTitle = () => {
    const item = menuItems.find(item => item.id === currentView)
    return item ? item.label : 'Dashboard'
  }

  const getViewDescription = () => {
    switch (currentView) {
      case 'dashboard':
        return 'System overview and monitoring'
      case 'projects':
        return 'Manage your containerized applications'
      case 'services':
        return 'Manage your application services and blueprints'
      case 'terminal':
        return 'Access your containers via web terminal'
      case 'logs':
        return 'View and search container logs in real-time'
      case 'domains':
        return 'Manage domains and SSL certificates'
      case 'settings':
        return 'Configure PanelX settings and preferences'
      default:
        return ''
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar className="w-64 border-r bg-card">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">P</span>
                </div>
                <h1 className="text-xl font-bold">PanelX</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Container Management</p>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant={currentView === item.id ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setCurrentView(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold">{getViewTitle()}</h2>
                  <p className="text-sm text-muted-foreground">{getViewDescription()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {error && currentView === 'dashboard' && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Metrics error</span>
                  </div>
                )}
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Process Details Dialog */}
      <ProcessDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        type={detailsType}
        title={detailsTitle}
      />
    </SidebarProvider>
  )
}