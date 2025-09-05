import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings, 
  Users, 
  Home, 
  Building2, 
  Car, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Bell
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  totalResidents: number
  totalUnits: number
  occupancyRate: number
  pendingIssues: number
  monthlyCollection: number
  totalVehicles: number
  activeAlerts: number
  upcomingEvents: number
}

export default function AdminPortal() {
  const [stats, setStats] = useState<DashboardStats>({
    totalResidents: 0,
    totalUnits: 0,
    occupancyRate: 0,
    pendingIssues: 0,
    monthlyCollection: 0,
    totalVehicles: 0,
    activeAlerts: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load residents count
      const { count: residentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'resident')

      // Load society units count
      const { count: unitCount } = await supabase
        .from('society_units')
        .select('*', { count: 'exact', head: true })

      // Load occupied units count
      const { count: occupiedCount } = await supabase
        .from('society_units')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied')

      // Load pending helpdesk tickets
      const { count: pendingCount } = await supabase
        .from('helpdesk_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress'])

      // Load active alerts
      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Load upcoming events
      const { count: eventCount } = await supabase
        .from('community_events')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', new Date().toISOString().split('T')[0])

      const occupancyRate = unitCount ? Math.round((occupiedCount || 0) / unitCount * 100) : 0

      setStats({
        totalResidents: residentCount || 0,
        totalUnits: unitCount || 0,
        occupancyRate,
        pendingIssues: pendingCount || 0,
        monthlyCollection: 125000, // Mock data
        totalVehicles: 89, // Mock data
        activeAlerts: alertCount || 0,
        upcomingEvents: eventCount || 0
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'Manage Residents',
      description: 'Add, edit, and manage resident information',
      icon: Users,
      path: '/residents',
      color: 'bg-blue-500'
    },
    {
      title: 'Society Management',
      description: 'Buildings, units, and facilities',
      icon: Building2,
      path: '/society-management-new',
      color: 'bg-green-500'
    },
    {
      title: 'Billing & Payments',
      description: 'Manage maintenance charges and payments',
      icon: TrendingUp,
      path: '/billing',
      color: 'bg-purple-500'
    },
    {
      title: 'Help Desk',
      description: 'Handle resident complaints and requests',
      icon: Shield,
      path: '/helpdesk',
      color: 'bg-orange-500'
    },
    {
      title: 'Announcements',
      description: 'Community notices and updates',
      icon: Bell,
      path: '/announcements',
      color: 'bg-red-500'
    },
    {
      title: 'Events Management',
      description: 'Plan and manage community events',
      icon: Calendar,
      path: '/events',
      color: 'bg-indigo-500'
    },
    {
      title: 'Vehicle Management',
      description: 'Parking slots and vehicle registration',
      icon: Car,
      path: '/vehicles',
      color: 'bg-cyan-500'
    },
    {
      title: 'Reports',
      description: 'Generate and view reports',
      icon: FileText,
      path: '/admin-reports',
      color: 'bg-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.full_name}! Here's what's happening in your community.
          </p>
        </div>
        <Button onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <p className="text-xs text-muted-foreground">Active residents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalUnits} total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Collection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyCollection.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-green-600 bg-green-100">
              All Systems Operational
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New resident registered in Building A-501</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Maintenance payment received for Unit B-203</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New complaint reported: Elevator maintenance</p>
                <p className="text-xs text-muted-foreground">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Community event scheduled for next week</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}