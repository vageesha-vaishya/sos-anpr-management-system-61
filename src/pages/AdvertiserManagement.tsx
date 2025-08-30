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
import { AdvertisementCampaignForm } from "@/components/forms/AdvertisementCampaignForm"
import { Plus, TrendingUp, DollarSign, Eye, BarChart3, Users, Play, Pause, Square } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface Advertiser {
  id: string
  billing_name: string
  customer_type: string
  status: string
  current_balance: number
  created_at: string
}

interface Campaign {
  id: string
  advertiser_id: string
  campaign_name: string
  campaign_type: string
  start_date: string
  end_date: string
  total_budget: number
  daily_budget: number
  billing_model: string
  rate: number
  status: string
  advertiser: {
    billing_name: string
  }
}

interface AdPlacement {
  id: string
  campaign_id: string
  placement_type: string
  placement_name: string
  daily_rate: number
  impressions_target: number
  clicks_target: number
  status: string
  campaign: {
    campaign_name: string
    advertiser: {
      billing_name: string
    }
  }
}

export default function AdvertiserManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [placements, setPlacements] = useState<AdPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalAdvertisers: 0,
    activeCampaigns: 0,
    totalBudget: 0,
    monthlyRevenue: 0,
    avgCampaignValue: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch advertisers (billing customers)
      const { data: advertisersData, error: advertisersError } = await supabase
        .from("billing_customers")
        .select("*")
        .eq("customer_type", "advertiser")
        .order("billing_name")

      if (advertisersError) throw advertisersError

      // Fetch campaigns with advertiser details using explicit relationship hint
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("advertisement_campaigns")
        .select(`
          *,
          advertiser:billing_customers!advertisement_campaigns_advertiser_id_fkey(billing_name)
        `)
        .order("start_date", { ascending: false })

      if (campaignsError) throw campaignsError

      // Fetch ad placements with campaign details using explicit relationship hint
      const { data: placementsData, error: placementsError } = await supabase
        .from("ad_placements")
        .select(`
          *,
          campaign:advertisement_campaigns!ad_placements_campaign_id_fkey(
            campaign_name,
            advertiser:billing_customers!advertisement_campaigns_advertiser_id_fkey(billing_name)
          )
        `)
        .order("created_at", { ascending: false })

      if (placementsError) throw placementsError

      setAdvertisers(advertisersData || [])
      setCampaigns((campaignsData as any) || [])
      setPlacements((placementsData as any) || [])

      // Calculate stats
      const totalAdvertisers = advertisersData?.length || 0
      const activeCampaigns = campaignsData?.filter(campaign => campaign.status === "active").length || 0
      const totalBudget = campaignsData?.reduce((sum, campaign) => sum + (campaign.total_budget || 0), 0) || 0
      const monthlyRevenue = campaignsData?.filter(campaign => {
        const startDate = new Date(campaign.start_date)
        const currentMonth = new Date()
        return startDate.getMonth() === currentMonth.getMonth() && 
               startDate.getFullYear() === currentMonth.getFullYear()
      }).reduce((sum, campaign) => sum + (campaign.total_budget || 0), 0) || 0
      
      const avgCampaignValue = campaignsData?.length ? totalBudget / campaignsData.length : 0
      const conversionRate = 85 // Placeholder - would be calculated from performance data

      setStats({
        totalAdvertisers,
        activeCampaigns,
        totalBudget,
        monthlyRevenue,
        avgCampaignValue,
        conversionRate,
      })

    } catch (error: any) {
      console.error("Error fetching advertiser data:", error)
      toast({
        title: "Error",
        description: "Failed to load advertiser management data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignSuccess = () => {
    setShowCampaignForm(false)
    setSelectedCampaign(null)
    fetchData()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "draft":
      case "paused":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "digital_signage":
        return <BarChart3 className="h-4 w-4" />
      case "banner":
        return <Eye className="h-4 w-4" />
      case "promotional":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const toggleCampaignStatus = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === "active" ? "paused" : "active"
      const { error } = await supabase
        .from("advertisement_campaigns")
        .update({ status: newStatus })
        .eq("id", campaign.id)

      if (error) throw error

      toast({ 
        title: "Success", 
        description: `Campaign ${newStatus === "active" ? "activated" : "paused"}` 
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Advertiser Management</h1>
          <p className="text-muted-foreground">Manage digital advertising campaigns and performance tracking</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advertisers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats.totalAdvertisers} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <AnimatedCounter value={stats.activeCampaigns} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $<AnimatedCounter value={stats.totalBudget} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              $<AnimatedCounter value={stats.monthlyRevenue} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Campaign Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $<AnimatedCounter value={Math.round(stats.avgCampaignValue)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              <AnimatedCounter value={stats.conversionRate} />%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Advertisement Campaigns</h2>
            <Dialog open={showCampaignForm} onOpenChange={setShowCampaignForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{selectedCampaign ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
                </DialogHeader>
                <AdvertisementCampaignForm
                  campaign={selectedCampaign}
                  organizationId={user?.user_metadata?.organization_id || ""}
                  advertisers={advertisers.map(adv => ({ id: adv.id, name: adv.billing_name }))}
                  onSuccess={handleCampaignSuccess}
                  onCancel={() => {
                    setShowCampaignForm(false)
                    setSelectedCampaign(null)
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
                    <TableHead>Campaign</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCampaignTypeIcon(campaign.campaign_type)}
                          <div>
                            <div className="font-medium">{campaign.campaign_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {campaign.billing_model} - ${campaign.rate}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.advertiser?.billing_name}</TableCell>
                      <TableCell className="capitalize">
                        {campaign.campaign_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>${campaign.total_budget}</div>
                          {campaign.daily_budget && (
                            <div className="text-sm text-muted-foreground">
                              ${campaign.daily_budget}/day
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(campaign.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(campaign.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCampaignStatus(campaign)}
                            disabled={campaign.status === "completed" || campaign.status === "cancelled"}
                          >
                            {campaign.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign)
                              setShowCampaignForm(true)
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Advertisers</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Advertiser Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisers.map((advertiser) => (
                    <TableRow key={advertiser.id}>
                      <TableCell className="font-medium">{advertiser.billing_name}</TableCell>
                      <TableCell className="capitalize">{advertiser.customer_type}</TableCell>
                      <TableCell>
                        <span className={advertiser.current_balance >= 0 ? "text-green-600" : "text-red-600"}>
                          ${advertiser.current_balance}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={advertiser.status === "active" ? "default" : "secondary"}>
                          {advertiser.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(advertiser.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ad Placements</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placement</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placements.map((placement) => (
                    <TableRow key={placement.id}>
                      <TableCell className="font-medium">{placement.placement_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{placement.campaign?.campaign_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {placement.campaign?.advertiser?.billing_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {placement.placement_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>${placement.daily_rate}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{placement.impressions_target.toLocaleString()} impressions</div>
                          <div className="text-muted-foreground">
                            {placement.clicks_target.toLocaleString()} clicks
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(placement.status)}>
                          {placement.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Campaigns:</span>
                    <span className="font-medium text-green-600">{stats.activeCampaigns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Budget:</span>
                    <span className="font-medium">${stats.totalBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Campaign Value:</span>
                    <span className="font-medium">${Math.round(stats.avgCampaignValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate:</span>
                    <span className="font-medium text-purple-600">{stats.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Monthly Revenue:</span>
                    <span className="font-medium text-blue-600">${stats.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue Growth:</span>
                    <span className="font-medium text-green-600">+15.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention:</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Average:</span>
                    <span className="font-medium text-purple-600">340%</span>
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