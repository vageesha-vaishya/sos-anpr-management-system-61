import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdvertisementCampaignForm } from "@/components/forms/AdvertisementCampaignForm"
import { Plus, Edit, Play, Pause, BarChart3, Eye, TrendingUp, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

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

interface Advertiser {
  id: string
  billing_name: string
}

interface AdvertiserCampaignsTableProps {
  campaigns: Campaign[]
  advertisers: Advertiser[]
  organizationId: string
  onRefresh: () => void
}

export function AdvertiserCampaignsTable({ 
  campaigns, 
  advertisers, 
  organizationId, 
  onRefresh 
}: AdvertiserCampaignsTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const { toast } = useToast()

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
      case "sponsored_event":
        return <Users className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getBillingModelColor = (model: string) => {
    switch (model) {
      case "CPM":
        return "text-blue-600"
      case "CPC":
        return "text-green-600"
      case "CPA":
        return "text-purple-600"
      case "fixed_monthly":
        return "text-orange-600"
      case "revenue_share":
        return "text-pink-600"
      default:
        return "text-gray-600"
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowForm(true)
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
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign status",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedCampaign(null)
    onRefresh()
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Advertisement Campaigns</CardTitle>
            <CardDescription>Manage digital advertising campaigns and performance</CardDescription>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
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
                organizationId={organizationId}
                advertisers={advertisers.map(adv => ({ id: adv.id, name: adv.billing_name }))}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedCampaign(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Budget & Model</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const daysRemaining = getDaysRemaining(campaign.end_date)
              return (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCampaignTypeIcon(campaign.campaign_type)}
                      <div>
                        <div className="font-medium">{campaign.campaign_name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {campaign.campaign_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{campaign.advertiser?.billing_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">${campaign.total_budget}</div>
                      <div className={`text-sm ${getBillingModelColor(campaign.billing_model)}`}>
                        {campaign.billing_model} - ${campaign.rate}
                      </div>
                      {campaign.daily_budget && (
                        <div className="text-xs text-muted-foreground">
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
                      {daysRemaining > 0 && (
                        <div className="text-xs text-blue-600">
                          {daysRemaining} days left
                        </div>
                      )}
                      {daysRemaining <= 0 && campaign.status === "active" && (
                        <div className="text-xs text-red-600">Expired</div>
                      )}
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
                        title={campaign.status === "active" ? "Pause campaign" : "Activate campaign"}
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
                        onClick={() => handleEdit(campaign)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}