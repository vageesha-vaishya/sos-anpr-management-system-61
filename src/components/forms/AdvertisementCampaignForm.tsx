import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const campaignSchema = z.object({
  advertiser_id: z.string().min(1, "Advertiser is required"),
  campaign_name: z.string().min(1, "Campaign name is required"),
  campaign_type: z.enum(["digital_signage", "banner", "promotional", "sponsored_event", "directory", "newsletter", "mobile_app"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  total_budget: z.number().min(0, "Budget must be positive"),
  daily_budget: z.number().min(0, "Daily budget must be positive").optional(),
  billing_model: z.enum(["CPM", "CPC", "CPA", "fixed_monthly", "revenue_share"]),
  rate: z.number().min(0, "Rate must be positive"),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).default("draft"),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface AdvertisementCampaignFormProps {
  campaign?: any
  organizationId: string
  advertisers: Array<{ id: string; name: string }>
  onSuccess: () => void
  onCancel: () => void
}

export function AdvertisementCampaignForm({ 
  campaign, 
  organizationId, 
  advertisers, 
  onSuccess, 
  onCancel 
}: AdvertisementCampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      advertiser_id: campaign?.advertiser_id || "",
      campaign_name: campaign?.campaign_name || "",
      campaign_type: campaign?.campaign_type || "digital_signage",
      start_date: campaign?.start_date ? new Date(campaign.start_date).toISOString().slice(0, 10) : "",
      end_date: campaign?.end_date ? new Date(campaign.end_date).toISOString().slice(0, 10) : "",
      total_budget: campaign?.total_budget || 0,
      daily_budget: campaign?.daily_budget || undefined,
      billing_model: campaign?.billing_model || "CPM",
      rate: campaign?.rate || 0,
      status: campaign?.status || "draft",
    },
  })

  const onSubmit = async (data: CampaignFormData) => {
    setIsLoading(true)
    try {
      const campaignData = {
        advertiser_id: data.advertiser_id,
        campaign_name: data.campaign_name,
        campaign_type: data.campaign_type,
        start_date: data.start_date,
        end_date: data.end_date,
        total_budget: data.total_budget,
        daily_budget: data.daily_budget || null,
        billing_model: data.billing_model,
        rate: data.rate,
        status: data.status,
        organization_id: organizationId,
      }

      if (campaign) {
        const { error } = await supabase
          .from("advertisement_campaigns")
          .update(campaignData)
          .eq("id", campaign.id)
        
        if (error) throw error
        toast({ title: "Success", description: "Campaign updated successfully" })
      } else {
        const { error } = await supabase
          .from("advertisement_campaigns")
          .insert([campaignData])
        
        if (error) throw error
        toast({ title: "Success", description: "Campaign created successfully" })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{campaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>
          {campaign ? "Update campaign information" : "Create a new advertisement campaign"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="advertiser_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertiser</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select advertiser" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {advertisers.map((advertiser) => (
                          <SelectItem key={advertiser.id} value={advertiser.id}>
                            {advertiser.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="digital_signage">Digital Signage</SelectItem>
                        <SelectItem value="banner">Banner Advertising</SelectItem>
                        <SelectItem value="promotional">Promotional Campaign</SelectItem>
                        <SelectItem value="sponsored_event">Sponsored Event</SelectItem>
                        <SelectItem value="directory">Directory Listing</SelectItem>
                        <SelectItem value="newsletter">Newsletter Ad</SelectItem>
                        <SelectItem value="mobile_app">Mobile App Ad</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CPM">CPM (Cost per Mille)</SelectItem>
                        <SelectItem value="CPC">CPC (Cost per Click)</SelectItem>
                        <SelectItem value="CPA">CPA (Cost per Action)</SelectItem>
                        <SelectItem value="fixed_monthly">Fixed Monthly</SelectItem>
                        <SelectItem value="revenue_share">Revenue Share</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="5000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daily_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="100.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="2.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : campaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}