import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocietyAdminDashboard } from "@/components/dashboard/SocietyAdminDashboard"
import { 
  Building,
  Users,
  DollarSign,
  Bell,
  Shield,
  Wrench,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Phone,
  Mail,
  Clock,
  Star
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface NoticeData {
  id: string
  title: string
  content: string
  notice_type: string
  priority: string
  status: string
  created_at: string
  read_count?: number
}

interface TransactionData {
  id: string
  transaction_number: string
  description: string
  total_amount: number
  status: string
  transaction_date: string
  transaction_type: string
}

interface ResidentData {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  last_login?: string
  unit_number?: string
}

const SocietyManagementEnhanced = () => {
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<NoticeData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [residents, setResidents] = useState<ResidentData[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch notices
      const { data: noticesData } = await supabase
        .from('society_notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(10)

      // Fetch residents/users
      const { data: residentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'resident')
        .order('created_at', { ascending: false })
        .limit(20)

      // Fetch dashboard metrics
      const { data: metricsData } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .order('calculation_date', { ascending: false })

      setNotices(noticesData || [])
      setTransactions(transactionsData || [])
      setResidents(residentsData || [])
      
      // Convert metrics array to object
      const metricsObj = (metricsData || []).reduce((acc: any, metric: any) => {
        acc[metric.metric_name] = metric.metric_value
        return acc
      }, {})
      setMetrics(metricsObj)

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load society data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'published': return 'default'
      case 'posted': return 'default'
      case 'inactive': return 'destructive'
      default: return 'outline'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Society Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Comprehensive housing society management platform with SOS integration
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            PHASE 1: Foundation Enhancement
          </Badge>
          <Button onClick={loadData} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="notices" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notices
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="residents" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Residents
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <SocietyAdminDashboard />
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Notices
                </CardTitle>
                <CardDescription>
                  Latest society announcements and communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{notice.title}</h4>
                      <Badge variant={getPriorityColor(notice.priority)}>
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {notice.content}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{notice.notice_type}</Badge>
                        <Badge variant={getStatusColor(notice.status)}>
                          {notice.status}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Notice Analytics
                </CardTitle>
                <CardDescription>
                  Communication effectiveness metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold text-primary">{notices.length}</h3>
                    <p className="text-sm text-muted-foreground">Active Notices</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold text-success">
                      {notices.filter(n => n.status === 'published').length}
                    </h3>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold text-warning">
                      {notices.filter(n => n.priority === 'high').length}
                    </h3>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-3xl font-bold text-info">85%</h3>
                    <p className="text-sm text-muted-foreground">Read Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest financial activities and payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{transaction.transaction_type}</Badge>
                        <Badge variant={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatCurrency(transaction.total_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.transaction_number}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>
                  Monthly financial overview and KPIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Total Collection</p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(metrics.total_collection || 0)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Outstanding Dues</p>
                        <p className="text-sm text-muted-foreground">Pending payments</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(metrics.outstanding_dues || 0)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Collection Efficiency</p>
                        <p className="text-sm text-muted-foreground">Success rate</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {(metrics.collection_efficiency || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Residents Tab */}
        <TabsContent value="residents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Resident Directory
              </CardTitle>
              <CardDescription>
                Manage society residents and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {residents.map((resident) => (
                  <div key={resident.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{resident.full_name}</h4>
                      <Badge variant={getStatusColor(resident.status)}>
                        {resident.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{resident.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4" />
                        <span className="capitalize">{resident.role}</span>
                      </div>
                      {resident.last_login && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last seen: {new Date(resident.last_login).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Communication Channels
                </CardTitle>
                <CardDescription>
                  Multi-channel messaging system status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Email Service</p>
                      <p className="text-sm text-muted-foreground">Primary communication</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold">SMS Gateway</p>
                      <p className="text-sm text-muted-foreground">Emergency alerts</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Configured</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Mobile app alerts</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Scheduled community activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Annual General Meeting</h4>
                    <p className="text-sm text-muted-foreground">March 15, 2024 • 6:00 PM</p>
                    <Badge variant="destructive" className="mt-2">High Priority</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Holi Celebration</h4>
                    <p className="text-sm text-muted-foreground">March 25, 2024 • 10:00 AM</p>
                    <Badge variant="default" className="mt-2">Community</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Water Maintenance</h4>
                    <p className="text-sm text-muted-foreground">March 10, 2024 • 9:00 AM</p>
                    <Badge variant="secondary" className="mt-2">Maintenance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Society management system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>10-Role User System</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Advanced Permissions</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Financial Management</span>
                    <Badge variant="default">Enhanced</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Communication System</span>
                    <Badge variant="default">Multi-channel</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Dashboard Analytics</span>
                    <Badge variant="default">Real-time</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Features
                </CardTitle>
                <CardDescription>
                  Security and compliance status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Row Level Security</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>User Activity Logs</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Data Encryption</span>
                    <Badge variant="default">AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Access Control</span>
                    <Badge variant="default">Granular</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Audit Trail</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SocietyManagementEnhanced