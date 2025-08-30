import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Camera, 
  Shield, 
  AlertTriangle, 
  Car,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react'

interface CustomerStats {
  totalCameras: number
  onlineCameras: number
  todayDetections: number
  whitelistedVehicles: number
  blacklistedVehicles: number
  pendingAlerts: number
}

export const CustomerDashboard = () => {
  const [stats, setStats] = useState<CustomerStats>({
    totalCameras: 0,
    onlineCameras: 0,
    todayDetections: 0,
    whitelistedVehicles: 0,
    blacklistedVehicles: 0,
    pendingAlerts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data for now
      setStats({
        totalCameras: 6,
        onlineCameras: 5,
        todayDetections: 89,
        whitelistedVehicles: 45,
        blacklistedVehicles: 3,
        pendingAlerts: 1
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Active Cameras',
      value: `${stats.onlineCameras}/${stats.totalCameras}`,
      description: 'Cameras online',
      icon: Camera,
      color: stats.onlineCameras === stats.totalCameras ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: "Today's Detections",
      value: stats.todayDetections,
      description: 'Vehicle entries/exits',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      title: 'Authorized Vehicles',
      value: stats.whitelistedVehicles,
      description: 'In whitelist',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Blocked Vehicles',
      value: stats.blacklistedVehicles,
      description: 'In blacklist',
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      description: 'Require attention',
      icon: AlertTriangle,
      color: stats.pendingAlerts > 0 ? 'text-red-600' : 'text-gray-400'
    },
    {
      title: 'Guest Passes',
      value: 12,
      description: 'Active today',
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location Manager</h1>
          <p className="text-muted-foreground">
            Building-specific monitoring, vehicle management, and visitor control
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" asChild>
            <Link to="/data-management">
              <Plus className="w-4 h-4 mr-2" />
              Location Access
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest vehicle detections at your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">MH12AB1234</p>
                <p className="text-xs text-muted-foreground">Main Gate • 3 min ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Authorized
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">DL08CA5678</p>
                <p className="text-xs text-muted-foreground">Visitor Gate • 7 min ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Guest Pass
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">UP16BX9012</p>
                <p className="text-xs text-muted-foreground">Service Gate • 12 min ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Car className="w-3 h-3 mr-1" />
                  Unknown
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Camera Status</CardTitle>
            <CardDescription>
              Current status of all security cameras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Main Gate Camera</span>
                <Badge variant="outline" className="text-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Visitor Gate Camera</span>
                <Badge variant="outline" className="text-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Gate Camera</span>
                <Badge variant="outline" className="text-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Back Exit Camera</span>
                <Badge variant="destructive">Offline</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parking Camera 1</span>
                <Badge variant="outline" className="text-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parking Camera 2</span>
                <Badge variant="outline" className="text-green-600">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common security management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Car className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Guest Pass
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              View Live Feed
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Security Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}