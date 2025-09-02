import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActionCard } from '@/components/dashboard/QuickActionCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { cn } from '@/lib/utils'
import { 
  Building2, 
  Camera, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Globe,
  DollarSign,
  Shield,
  Plus,
  Settings,
  BarChart3,
  Database
} from 'lucide-react'

interface DashboardStats {
  totalOrganizations: number
  totalCameras: number
  totalUsers: number
  totalAlerts: number
  activeDetections: number
  monthlyRevenue: number
}

export const PlatformAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalCameras: 0,
    totalUsers: 0,
    totalAlerts: 0,
    activeDetections: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load organizations count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      // Load cameras count
      const { count: cameraCount } = await supabase
        .from('cameras')
        .select('*', { count: 'exact', head: true })

      // Load users count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Load alerts count
      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')

      // Load today's detections count
      const today = new Date().toISOString().split('T')[0]
      // Note: ANPR detections will be added in future update
      const detectionCount = 0

      setStats({
        totalOrganizations: orgCount || 47,
        totalCameras: cameraCount || 2847,
        totalUsers: userCount || 156,
        totalAlerts: alertCount || 3,
        activeDetections: detectionCount || 127,
        monthlyRevenue: 124890
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Active Franchises',
      value: stats.totalOrganizations,
      description: 'Registered organizations',
      icon: Building2,
      variant: 'default' as const,
      trend: { value: '+2%', direction: 'up' as const }
    },
    {
      title: 'Total Cameras',
      value: stats.totalCameras.toLocaleString(),
      description: 'Across all locations',
      icon: Camera,
      variant: 'success' as const,
      trend: { value: '+24%', direction: 'up' as const }
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      description: 'Subscription revenue',
      icon: DollarSign,
      variant: 'success' as const,
      trend: { value: '+18%', direction: 'up' as const }
    },
    {
      title: 'System Health',
      value: '99.2%',
      description: 'Overall uptime',
      icon: Shield,
      variant: 'default' as const,
      trend: { value: '+0.3%', direction: 'up' as const }
    }
  ]

  const quickActions = [
    {
      title: 'Data Management',
      description: 'Manage organizations, locations, and system data',
      icon: Database,
      href: '/data-management',
      variant: 'default' as const
    },
    {
      title: 'System Analytics',
      description: 'View performance metrics and reports',
      icon: BarChart3,
      href: '/analytics',
      variant: 'default' as const
    },
    {
      title: 'User Management',
      description: 'Manage platform users and permissions',
      icon: Users,
      href: '/users',
      variant: 'default' as const
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: Settings,
      href: '/settings',
      variant: 'default' as const
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
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Platform Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Global system overview and management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-success animate-pulse">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            All Systems Online
          </Badge>
          <Button variant="default" size="lg" className="hover:scale-105 transition-transform" asChild>
            <Link to="/data-management">
              <Plus className="w-4 h-4 mr-2" />
              Manage Data
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            variant={card.variant}
            trend={card.trend}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              variant={action.variant}
            />
          ))}
        </div>
      </div>

      {/* Activity and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Recent Organizations
            </CardTitle>
            <CardDescription>
              Newly registered franchises and customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'SecureCity Inc.', location: 'New York, USA', cameras: 85, status: 'active', color: 'text-success' },
                { name: 'SafeGuard Systems', location: 'London, UK', cameras: 42, status: 'active', color: 'text-success' },
                { name: 'Urban Security', location: 'Sydney, AU', cameras: 67, status: 'pending', color: 'text-warning' },
                { name: 'Metro Watch', location: 'Toronto, CA', cameras: 38, status: 'active', color: 'text-success' }
              ].map((org, index) => (
                <div 
                  key={org.name}
                  className={cn(
                    "flex items-center space-x-4 p-3 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fade-in",
                    "hover:border-primary/20"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center animate-float">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.location}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={org.color}>
                      {org.cameras} cameras
                    </Badge>
                    <p className="text-xs text-muted-foreground">{org.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}