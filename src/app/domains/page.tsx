'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Globe, 
  Plus, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  RefreshCw,
  FileText,
  Database,
  Zap
} from 'lucide-react'

interface Domain {
  id: string
  domain: string
  status: 'active' | 'pending' | 'error' | 'expired'
  ssl: {
    enabled: boolean
    provider: 'letsencrypt' | 'custom' | 'none'
    expiresAt?: Date
    issuer?: string
  }
  target: {
    service: string
    port: number
    path?: string
  }
  security: {
    forceHttps: boolean
    hsts: boolean
    basicAuth?: {
      enabled: boolean
      username?: string
    }
  }
  createdAt: Date
  updatedAt: Date
  lastChecked?: Date
  dns: {
    status: 'configured' | 'pending' | 'error'
    records: DNSRecord[]
  }
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT'
  name: string
  value: string
  ttl: number
  status: 'active' | 'pending' | 'error'
}

export default function DomainsPage() {
  const [mounted, setMounted] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [dnsDialogOpen, setDnsDialogOpen] = useState(false)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data
  const mockDomains: Domain[] = [
    {
      id: '1',
      domain: 'example.com',
      status: 'active',
      ssl: {
        enabled: true,
        provider: 'letsencrypt',
        expiresAt: new Date('2024-07-20'),
        issuer: "Let's Encrypt"
      },
      target: {
        service: 'web-server',
        port: 80
      },
      security: {
        forceHttps: true,
        hsts: true,
        basicAuth: {
          enabled: false
        }
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      lastChecked: new Date('2024-01-20T15:30:00'),
      dns: {
        status: 'configured',
        records: [
          { type: 'A', name: 'example.com', value: '192.168.1.100', ttl: 3600, status: 'active' },
          { type: 'A', name: 'www.example.com', value: '192.168.1.100', ttl: 3600, status: 'active' }
        ]
      }
    },
    {
      id: '2',
      domain: 'api.example.com',
      status: 'active',
      ssl: {
        enabled: true,
        provider: 'letsencrypt',
        expiresAt: new Date('2024-08-15'),
        issuer: "Let's Encrypt"
      },
      target: {
        service: 'api-server',
        port: 3000
      },
      security: {
        forceHttps: true,
        hsts: false,
        basicAuth: {
          enabled: false
        }
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      lastChecked: new Date('2024-01-20T15:25:00'),
      dns: {
        status: 'configured',
        records: [
          { type: 'A', name: 'api.example.com', value: '192.168.1.100', ttl: 3600, status: 'active' }
        ]
      }
    },
    {
      id: '3',
      domain: 'staging.example.com',
      status: 'pending',
      ssl: {
        enabled: false,
        provider: 'none'
      },
      target: {
        service: 'web-server',
        port: 8080
      },
      security: {
        forceHttps: false,
        hsts: false,
        basicAuth: {
          enabled: true,
          username: 'admin'
        }
      },
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      dns: {
        status: 'pending',
        records: []
      }
    }
  ]

  useState(() => {
    setDomains(mockDomains)
  })

  const getStatusColor = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'outline'
      case 'error':
        return 'destructive'
      case 'expired':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSSLStatus = (domain: Domain) => {
    if (!domain.ssl.enabled) return { text: 'HTTP Only', color: 'secondary' }
    if (domain.status === 'error') return { text: 'SSL Error', color: 'destructive' }
    if (mounted && domain.ssl.expiresAt && domain.ssl.expiresAt < new Date()) {
      return { text: 'Expired', color: 'destructive' }
    }
    return { text: 'Active', color: 'default' }
  }

  const formatExpiry = (date?: Date) => {
    if (!date || !mounted) return 'N/A'
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return 'Expired'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.floor(days / 30)} months`
    return `${Math.floor(days / 365)} years`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openDomain = (domain: string) => {
    window.open(`https://${domain}`, '_blank')
  }

  const getDomainStats = () => {
    return {
      total: domains.length,
      active: domains.filter(d => d.status === 'active').length,
      sslEnabled: domains.filter(d => d.ssl.enabled).length,
      httpsOnly: domains.filter(d => d.security.forceHttps).length
    }
  }

  const stats = getDomainStats()

  const CreateDomainDialog = () => {
    const [formData, setFormData] = useState({
      domain: '',
      service: '',
      port: 80,
      enableSSL: true,
      forceHttps: true
    })

    const services = ['web-server', 'api-server', 'database', 'redis-cache']

    const handleSubmit = async () => {
      if (!formData.domain || !formData.service || !mounted) return

      const newDomain: Domain = {
        id: Date.now().toString(),
        domain: formData.domain,
        status: 'pending',
        ssl: {
          enabled: formData.enableSSL,
          provider: formData.enableSSL ? 'letsencrypt' : 'none'
        },
        target: {
          service: formData.service,
          port: formData.port
        },
        security: {
          forceHttps: formData.forceHttps,
          hsts: formData.forceHttps,
          basicAuth: { enabled: false }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        dns: {
          status: 'pending',
          records: []
        }
      }

      setDomains(prev => [...prev, newDomain])
      setCreateDialogOpen(false)
      setFormData({
        domain: '',
        service: '',
        port: 80,
        enableSSL: true,
        forceHttps: true
      })
    }

    return (
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Domain</DialogTitle>
            <DialogDescription>
              Configure a new domain with SSL and routing settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain Name *</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Target Service</Label>
                <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable SSL</Label>
                  <p className="text-sm text-muted-foreground">Automatically provision SSL certificate</p>
                </div>
                <Switch
                  checked={formData.enableSSL}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSSL: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Force HTTPS</Label>
                  <p className="text-sm text-muted-foreground">Redirect HTTP to HTTPS</p>
                </div>
                <Switch
                  checked={formData.forceHttps}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, forceHttps: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.domain || !formData.service}>
              Add Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const DomainSettingsDialog = ({ domain }: { domain: Domain }) => {
    const [settings, setSettings] = useState({
      forceHttps: domain.security.forceHttps,
      hsts: domain.security.hsts,
      basicAuthEnabled: domain.security.basicAuth?.enabled || false,
      basicAuthUsername: domain.security.basicAuth?.username || ''
    })

    const handleSave = () => {
      setDomains(prev => prev.map(d => 
        d.id === domain.id 
          ? {
              ...d,
              security: {
                ...d.security,
                forceHttps: settings.forceHttps,
                hsts: settings.hsts,
                basicAuth: {
                  enabled: settings.basicAuthEnabled,
                  username: settings.basicAuthUsername
                }
              }
            }
          : d
      ))
      setSettingsDialogOpen(false)
    }

    return (
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Domain Settings - {domain.domain}</DialogTitle>
            <DialogDescription>
              Configure security and routing settings for this domain
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Force HTTPS</Label>
                <p className="text-sm text-muted-foreground">Redirect all HTTP traffic to HTTPS</p>
              </div>
              <Switch
                checked={settings.forceHttps}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, forceHttps: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>HSTS</Label>
                <p className="text-sm text-muted-foreground">Enable HTTP Strict Transport Security</p>
              </div>
              <Switch
                checked={settings.hsts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, hsts: checked }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Basic Authentication</Label>
                  <p className="text-sm text-muted-foreground">Protect with username/password</p>
                </div>
                <Switch
                  checked={settings.basicAuthEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, basicAuthEnabled: checked }))}
                />
              </div>

              {settings.basicAuthEnabled && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.basicAuthUsername}
                    onChange={(e) => setSettings(prev => ({ ...prev, basicAuthUsername: e.target.value }))}
                    placeholder="admin"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const DNSRecordsDialog = ({ domain }: { domain: Domain }) => {
    return (
      <Dialog open={dnsDialogOpen} onOpenChange={setDnsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>DNS Configuration - {domain.domain}</DialogTitle>
            <DialogDescription>
              DNS records required for this domain to work properly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={domain.dns.status === 'configured' ? 'default' : 'outline'}>
                {domain.dns.status}
              </Badge>
              {domain.dns.status === 'configured' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Required DNS Records</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="font-mono text-sm">A</div>
                  <div className="font-mono text-sm">{domain.domain}</div>
                  <div className="font-mono text-sm text-muted-foreground">192.168.1.100</div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard('192.168.1.100')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="font-mono text-sm">A</div>
                  <div className="font-mono text-sm">www.{domain.domain}</div>
                  <div className="font-mono text-sm text-muted-foreground">192.168.1.100</div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard('192.168.1.100')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Current Records</h4>
              {domain.dns.records.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No DNS records found
                </div>
              ) : (
                <div className="space-y-2">
                  {domain.dns.records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{record.type}</Badge>
                        <div className="font-mono text-sm">{record.name}</div>
                        <div className="font-mono text-sm">{record.value}</div>
                        <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDnsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setDnsDialogOpen(false)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check DNS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="h-screen bg-background">
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Domain Management</h1>
            <p className="text-muted-foreground">Manage domains, SSL certificates, and routing</p>
          </div>
          <CreateDomainDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SSL Enabled</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sslEnabled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HTTPS Only</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.httpsOnly}</div>
            </CardContent>
          </Card>
        </div>

        {/* Domains List */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {domains.map((domain) => {
              const sslStatus = getSSLStatus(domain)
              return (
                <Card key={domain.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(domain.status)}
                          <CardTitle className="text-lg">{domain.domain}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(domain.status)}>
                            {domain.status}
                          </Badge>
                          <Badge variant={sslStatus.color}>
                            <Shield className="w-3 h-3 mr-1" />
                            {sslStatus.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DomainSettingsDialog domain={domain} />
                        <DNSRecordsDialog domain={domain} />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDomain(domain.domain)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Target Service */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        Target Service
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {domain.target.service}:{domain.target.port}
                        {domain.target.path && ` → ${domain.target.path}`}
                      </div>
                    </div>

                    {/* SSL Information */}
                    {domain.ssl.enabled && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Shield className="w-4 h-4" />
                          SSL Certificate
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="ml-1">{domain.ssl.provider}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="ml-1">{formatExpiry(domain.ssl.expiresAt)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Security Settings
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {domain.security.forceHttps && (
                          <Badge variant="outline">HTTPS Forced</Badge>
                        )}
                        {domain.security.hsts && (
                          <Badge variant="outline">HSTS Enabled</Badge>
                        )}
                        {domain.security.basicAuth?.enabled && (
                          <Badge variant="outline">Basic Auth</Badge>
                        )}
                      </div>
                    </div>

                    {/* DNS Status */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Database className="w-4 h-4" />
                        DNS Status
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={domain.dns.status === 'configured' ? 'default' : 'outline'}>
                          {domain.dns.status}
                        </Badge>
                        {domain.dns.records.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {domain.dns.records.length} records
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openDomain(domain.domain)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(domain.domain)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Created: {domain.createdAt.toLocaleDateString()}</span>
                      <span>Updated: {domain.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}