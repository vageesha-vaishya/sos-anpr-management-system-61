import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { 
  Camera, 
  Users, 
  AlertTriangle, 
  MapPin, 
  Shield,
  TrendingUp,
  Building2,
  Activity,
  Plus
} from 'lucide-react'

interface FranchiseStats {
  totalLocations: number
  totalCameras: number
  totalUsers: number
  pendingAlerts: number
  todayDetections: number
  onlineCameras: number
}

export const FranchiseAdminDashboard = () => {
  const [stats, setStats] = useState<FranchiseStats>({
    totalLocations: 0,
    totalCameras: 0,
    totalUsers: 0,
    pendingAlerts: 0,
    todayDetections: 0,
    onlineCameras: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data for now since tables might not exist yet
      setStats({
        totalLocations: 12,
        totalCameras: 85,
        totalUsers: 28,
        pendingAlerts: 2,
        todayDetections: 456,
        onlineCameras: 82
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Active Locations',
      value: stats.totalLocations,
      description: 'Buildings under management',
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Total Cameras',
      value: stats.totalCameras,
      description: `${stats.onlineCameras} online`,
      icon: Camera,
      color: 'text-green-600'
    },
    {
      title: 'Team Members',
      value: stats.totalUsers,
      description: 'Active users',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      description: 'Require attention',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: "Today's Activity",
      value: stats.todayDetections,
      description: 'Vehicle detections',
      icon: Shield,
      color: 'text-orange-600'
    },
    {
      title: 'System Health',
      value: '98.5%',
      description: 'Camera uptime',
      icon: Activity,
      color: 'text-emerald-600'
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
          <h1 className="text-3xl font-bold tracking-tight">Franchise Dashboard</h1>
          <p className="text-muted-foreground">
            Multi-location oversight, camera management, and team coordination
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" asChild>
            <Link to="/data-management">
              <Plus className="w-4 h-4 mr-2" />
              Regional Access
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

      {/* Location Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest vehicle detections across locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">ABC123 - Main Gate</p>
                <p className="text-xs text-muted-foreground">Residential Complex A • 2 min ago</p>
              </div>
              <Badge variant="outline" className="text-green-600">Authorized</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">XYZ789 - Visitor Gate</p>
                <p className="text-xs text-muted-foreground">Office Building B • 5 min ago</p>
              </div>
              <Badge variant="destructive">Alert</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">DEF456 - Service Gate</p>
                <p className="text-xs text-muted-foreground">Industrial Complex C • 8 min ago</p>
              </div>
              <Badge variant="outline">Unknown</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
            <CardDescription>
              Camera status across your locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Residential Complex A</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">8/8 Online</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Office Building B</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-yellow-600">5/6 Online</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Industrial Complex C</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">12/12 Online</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Shopping Mall D</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-red-600">15/18 Online</Badge>
                </div>
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
            Common franchise management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              Add Location
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Configure Cameras
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}