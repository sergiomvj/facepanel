'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { 
  Activity, 
  Database, 
  HardDrive, 
  Wifi, 
  TrendingUp, 
  TrendingDown,
  Maximize2,
  Info
} from 'lucide-react'

interface MetricDataPoint {
  timestamp: number
  value: number
}

interface MetricChartProps {
  title: string
  data: MetricDataPoint[]
  icon: any
  unit: string
  color: string
  type?: 'line' | 'area' | 'bar'
  maxValue?: number
  showDetails?: boolean
  onShowDetails?: () => void
}

export function MetricChart({
  title,
  data,
  icon: Icon,
  unit,
  color,
  type = 'line',
  maxValue = 100,
  showDetails = false,
  onShowDetails
}: MetricChartProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    switch (timeRange) {
      case '1h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '6h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit' })
      case '7d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      default:
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const chartData = data.map(point => ({
    timestamp: formatTimestamp(point.timestamp),
    value: point.value,
    fullTimestamp: point.timestamp
  }))

  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const trend = currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable'

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, maxValue]} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value)}${unit}`}
            />
            <Tooltip 
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number) => [`${Math.round(value)}${unit}`, title]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, maxValue]} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value)}${unit}`}
            />
            <Tooltip 
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number) => [`${Math.round(value)}${unit}`, title]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        )
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, maxValue]} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value)}${unit}`}
            />
            <Tooltip 
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number) => [`${Math.round(value)}${unit}`, title]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        )
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold">{Math.round(currentValue)}{unit}</span>
                {trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                )}
                {trend === 'down' && (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {showDetails && onShowDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowDetails}
                className="gap-1 h-7 px-2"
              >
                <Maximize2 className="h-3 w-3" />
                <span className="text-xs">Details</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-1">
          {(['1h', '6h', '24h', '7d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-6 px-2 text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 pb-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t">
          <div className="text-center px-1">
            <div className="text-xs text-muted-foreground truncate">Avg</div>
            <div className="text-sm font-semibold">
              {Math.round(data.reduce((sum, point) => sum + point.value, 0) / data.length)}{unit}
            </div>
          </div>
          <div className="text-center px-1">
            <div className="text-xs text-muted-foreground truncate">Peak</div>
            <div className="text-sm font-semibold">
              {Math.round(Math.max(...data.map(point => point.value)))}{unit}
            </div>
          </div>
          <div className="text-center px-1">
            <div className="text-xs text-muted-foreground truncate">Low</div>
            <div className="text-sm font-semibold">
              {Math.round(Math.min(...data.map(point => point.value)))}{unit}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}