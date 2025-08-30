import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { CameraSubscriptionForm } from "@/components/forms/CameraSubscriptionForm"
import { Plus, Camera, DollarSign, Zap, Activity, TrendingUp, Users } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface CameraSubscription {
  id: string
  customer_id: string
  camera_id: string
  subscription_plan: string
  monthly_fee: number
  installation_fee: number
  start_date: string
  end_date: string
  auto_renew: boolean
  status: string
  features: any
  customer: {
    billing_name: string
  }
  camera: {
    name: string
    location: string
  }
}

interface ANPRServiceCharge {
  id: string
  customer_id: string
  service_type: string
  charge_amount: number
  billing_date: string
  quantity: number
  unit_price: number
  status: string
  customer: {
    billing_name: string
  }
}

export default function ANPRServiceBilling() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<CameraSubscription[]>([])
  const [serviceCharges, setServiceCharges] = useState<ANPRServiceCharge[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [cameras, setCameras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<CameraSubscription | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    averageSubscriptionValue: 0,
    basicPlans: 0,
    professionalPlans: 0,
    enterprisePlans: 0,
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch camera subscriptions with explicit relationship hint
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("camera_subscriptions")
        .select(`
          *,
          customer:billing_customers!camera_subscriptions_customer_id_fkey(billing_name),
          camera:cameras(name)
        `)
        .order("start_date", { ascending: false })

      if (subscriptionsError) throw subscriptionsError

      // Fetch ANPR service charges with explicit relationship hint
      const { data: chargesData, error: chargesError } = await supabase
        .from("anpr_service_charges")
        .select(`
          *,
          customer:billing_customers!anpr_service_charges_customer_id_fkey(billing_name)
        `)
        .order("billing_date", { ascending: false })

      if (chargesError) throw chargesError

      // Fetch customers for forms
      const { data: customersData, error: customersError } = await supabase
        .from("billing_customers")
        .select("id, billing_name")
        .order("billing_name")

      if (customersError) throw customersError

      // Fetch cameras for forms
      const { data: camerasData, error: camerasError } = await supabase
        .from("cameras")
        .select(`
          id, 
          name,
          locations:entry_gates(
            buildings(
              locations(name)
            )
          )
        `)
        .order("name")

      if (camerasError) throw camerasError

      setSubscriptions((subscriptionsData as any) || [])
      setServiceCharges((chargesData as any) || [])
      setCustomers(customersData || [])
      setCameras(camerasData?.map(camera => ({
        id: camera.id,
        name: camera.name,
        location: (camera as any).locations?.buildings?.locations?.name || "Unknown"
      })) || [])

      // Calculate stats
      const totalSubscriptions = subscriptionsData?.length || 0
      const activeSubscriptions = subscriptionsData?.filter(sub => sub.status === "active").length || 0
      const monthlyRevenue = subscriptionsData?.filter(sub => sub.status === "active")
        .reduce((sum, sub) => sum + (sub.monthly_fee || 0), 0) || 0
      const averageSubscriptionValue = activeSubscriptions > 0 ? monthlyRevenue / activeSubscriptions : 0

      const basicPlans = subscriptionsData?.filter(sub => sub.subscription_plan === "basic").length || 0
      const professionalPlans = subscriptionsData?.filter(sub => sub.subscription_plan === "professional").length || 0
      const enterprisePlans = subscriptionsData?.filter(sub => sub.subscription_plan === "enterprise").length || 0

      setStats({
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        averageSubscriptionValue,
        basicPlans,
        professionalPlans,
        enterprisePlans,
      })

    } catch (error: any) {
      console.error("Error fetching ANPR billing data:", error)
      toast({
        title: "Error",
        description: "Failed to load ANPR service billing data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionForm(false)
    setSelectedSubscription(null)
    fetchData()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "suspended":
        return "destructive"
      case "cancelled":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "text-blue-600"
      case "professional":
        return "text-green-600"
      case "enterprise":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ANPR Service Billing</h1>
          <p className="text-muted-foreground">Manage camera subscriptions and ANPR service charges</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.totalSubscriptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.activeSubscriptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $<AnimatedCounter value={stats.monthlyRevenue} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Subscription</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $<AnimatedCounter value={Math.round(stats.averageSubscriptionValue)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basic Plans</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedCounter value={stats.basicPlans} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professional</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.professionalPlans} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              <AnimatedCounter value={stats.enterprisePlans} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Camera Subscriptions</TabsTrigger>
          <TabsTrigger value="charges">Service Charges</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Camera Subscriptions</h2>
            <Dialog open={showSubscriptionForm} onOpenChange={setShowSubscriptionForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSubscription ? "Edit Subscription" : "Create New Subscription"}
                  </DialogTitle>
                </DialogHeader>
                <CameraSubscriptionForm
                  subscription={selectedSubscription}
                  customers={customers.map(cust => ({ 
                    id: cust.id, 
                    billing_name: cust.billing_name 
                  }))}
                  cameras={cameras}
                  onSuccess={handleSubscriptionSuccess}
                  onCancel={() => {
                    setShowSubscriptionForm(false)
                    setSelectedSubscription(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Camera & Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span className="font-medium">{subscription.camera?.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.customer?.billing_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium capitalize ${getPlanColor(subscription.subscription_plan)}`}>
                          {subscription.subscription_plan}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subscription.features?.cameras_included === 999 
                            ? "Unlimited cameras" 
                            : `Up to ${subscription.features?.cameras_included} cameras`
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${subscription.monthly_fee}/month</div>
                          {subscription.installation_fee > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Setup: ${subscription.installation_fee}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(subscription.start_date).toLocaleDateString()}</div>
                          {subscription.end_date && (
                            <div className="text-muted-foreground">
                              to {new Date(subscription.end_date).toLocaleDateString()}
                            </div>
                          )}
                          <div className={`text-xs ${subscription.auto_renew ? 'text-green-600' : 'text-orange-600'}`}>
                            {subscription.auto_renew ? 'Auto-renew' : 'Manual renewal'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription)
                            setShowSubscriptionForm(true)
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Charges</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Charge Details</TableHead>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceCharges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">
                        {charge.customer?.billing_name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {charge.service_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${charge.charge_amount}</div>
                          <div className="text-sm text-muted-foreground">
                            {charge.quantity} × ${charge.unit_price}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(charge.billing_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(charge.status)}>
                          {charge.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Basic Plan</CardTitle>
                <CardDescription>Perfect for small businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$99<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>• Up to 5 cameras</li>
                  <li>• 10GB storage included</li>
                  <li>• Basic detection features</li>
                  <li>• Email support</li>
                  <li>• $0.01 per extra detection</li>
                </ul>
                <div className="mt-4 text-right">
                  <span className="text-2xl font-bold text-blue-600">{stats.basicPlans}</span>
                  <span className="text-sm text-muted-foreground ml-1">active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Professional Plan</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$199<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>• Up to 15 cameras</li>
                  <li>• 50GB storage included</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• Volume discounts available</li>
                </ul>
                <div className="mt-4 text-right">
                  <span className="text-2xl font-bold text-green-600">{stats.professionalPlans}</span>
                  <span className="text-sm text-muted-foreground ml-1">active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">Enterprise Plan</CardTitle>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$399<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited cameras</li>
                  <li>• 500GB storage included</li>
                  <li>• Premium analytics & AI</li>
                  <li>• API access</li>
                  <li>• 24/7 dedicated support</li>
                </ul>
                <div className="mt-4 text-right">
                  <span className="text-2xl font-bold text-purple-600">{stats.enterprisePlans}</span>
                  <span className="text-sm text-muted-foreground ml-1">active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add-on Services</CardTitle>
              <CardDescription>Additional services and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Usage-Based Charges</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• $0.01 per detection (over plan limit)</div>
                    <div>• $0.10 per GB storage (over plan limit)</div>
                    <div>• $0.05 per GB bandwidth usage</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Premium Features</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• Advanced Analytics: +$50/month</div>
                    <div>• API Access: +$25/month</div>
                    <div>• Technical Support: +$100/month</div>
                    <div>• Setup & Installation: $500 one-time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}