import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./StatsCard"
import { QuickActionCard } from "./QuickActionCard"
import { ActivityFeed } from "./ActivityFeed"
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Bell,
  FileText,
  Settings,
  Home,
  Shield,
  Wrench,
  CreditCard,
  MessageSquare,
  BarChart3,
  Plus
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalResidents: number
  totalCollection: number
  outstandingDues: number
  collectionEfficiency: number
  pendingComplaints: number
  activeNotices: number
  monthlyIncome: number
  monthlyExpenses: number
  occupancyRate: number
  maintenanceRequests: number
}

export const SocietyAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalResidents: 0,
    totalCollection: 0,
    outstandingDues: 0,
    collectionEfficiency: 0,
    pendingComplaints: 0,
    activeNotices: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    occupancyRate: 0,
    maintenanceRequests: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentNotices, setRecentNotices] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const { toast } = useToast()

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard metrics
      const { data: metrics } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .order('calculation_date', { ascending: false })

      // Fetch recent notices
      const { data: notices } = await supabase
        .from('society_notices')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (metrics) {
        const metricsMap = metrics.reduce((acc: any, metric: any) => {
          acc[metric.metric_name] = metric.metric_value
          return acc
        }, {})

        setStats({
          totalResidents: metricsMap.active_residents || 0,
          totalCollection: metricsMap.total_collection || 0,
          outstandingDues: metricsMap.outstanding_dues || 0,
          collectionEfficiency: metricsMap.collection_efficiency || 0,
          pendingComplaints: metricsMap.pending_complaints || 0,
          activeNotices: notices?.length || 0,
          monthlyIncome: metricsMap.total_collection || 0,
          monthlyExpenses: (metricsMap.total_collection || 0) * 0.3,
          occupancyRate: ((metricsMap.occupied_units || 0) / (metricsMap.total_units || 1)) * 100,
          maintenanceRequests: metricsMap.completed_requests || 0
        })
      }

      setRecentNotices(notices || [])
      setRecentTransactions(transactions || [])
    } catch (error: any) {
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

  const statCards = [
    {
      title: "Total Residents",
      value: stats.totalResidents.toString(),
      description: "Active residents in society",
      icon: Users,
      trend: { value: "+3 this month", direction: "up" as const },
      variant: "default" as const
    },
    {
      title: "Collection This Month",
      value: `₹${(stats.totalCollection / 100000).toFixed(1)}L`,
      description: "Maintenance fees collected",
      icon: DollarSign,
      trend: { value: "+12% from last month", direction: "up" as const },
      variant: "success" as const
    },
    {
      title: "Outstanding Dues",
      value: `₹${(stats.outstandingDues / 100000).toFixed(1)}L`,
      description: "Pending payments",
      icon: AlertTriangle,
      trend: { value: "-5% from last month", direction: "down" as const },
      variant: "warning" as const
    },
    {
      title: "Collection Efficiency",
      value: `${stats.collectionEfficiency.toFixed(1)}%`,
      description: "Payment success rate",
      icon: TrendingUp,
      trend: { value: "+2.3% improvement", direction: "up" as const },
      variant: "success" as const
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate.toFixed(1)}%`,
      description: "Units occupied",
      icon: Home,
      trend: { value: "Stable", direction: "up" as const },
      variant: "default" as const
    },
    {
      title: "Pending Complaints",
      value: stats.pendingComplaints.toString(),
      description: "Maintenance requests",
      icon: Wrench,
      trend: { value: "-3 resolved today", direction: "down" as const },
      variant: "destructive" as const
    }
  ]

  const quickActions = [
    {
      title: "Send Notice",
      description: "Create and publish society notices",
      icon: Bell,
      href: "/announcements",
      color: "bg-blue-500"
    },
    {
      title: "Financial Reports",
      description: "View income and expense reports",
      icon: BarChart3,
      href: "/billing",
      color: "bg-green-500"
    },
    {
      title: "Maintenance Billing",
      description: "Generate monthly bills",
      icon: CreditCard,
      href: "/maintenance-billing",
      color: "bg-purple-500"
    },
    {
      title: "User Management",
      description: "Manage residents and staff",
      icon: Users,
      href: "/users",
      color: "bg-orange-500"
    },
    {
      title: "Security Settings",
      description: "Access control and permissions",
      icon: Shield,
      href: "/settings",
      color: "bg-red-500"
    },
    {
      title: "Communication",
      description: "Multi-channel messaging",
      icon: MessageSquare,
      href: "/announcements",
      color: "bg-indigo-500"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Society Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening in your society today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            System Healthy
          </Badge>
          <Button onClick={loadDashboardData} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="notices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notices">Recent Notices</TabsTrigger>
          <TabsTrigger value="transactions">Financial Activity</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Status</TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Published Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{notice.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={notice.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notice.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.transaction_type}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ₹{transaction.total_amount.toLocaleString()}
                      </p>
                      <Badge variant={transaction.status === 'posted' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-green-600">{stats.maintenanceRequests}</h3>
                  <p className="text-sm text-muted-foreground">Completed Requests</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-orange-600">{stats.pendingComplaints}</h3>
                  <p className="text-sm text-muted-foreground">Pending Complaints</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}