import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const advertisementCampaignSchema = z.object({
  campaign_name: z.string().min(1, 'Campaign name is required'),
  campaign_type: z.string().min(1, 'Campaign type is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  budget: z.number().min(0).optional(),
  description: z.string().optional(),
  advertiser_id: z.string().optional()
})

type AdvertisementCampaignFormData = z.infer<typeof advertisementCampaignSchema>

interface AdvertisementCampaignFormProps {
  onSuccess?: () => void
  editData?: any
}

export const AdvertisementCampaignFormFull: React.FC<AdvertisementCampaignFormProps> = ({ onSuccess, editData }) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<AdvertisementCampaignFormData>({
    resolver: zodResolver(advertisementCampaignSchema),
    defaultValues: editData || {
      campaign_name: '',
      campaign_type: '',
      start_date: '',
      end_date: '',
      budget: 0,
      description: '',
      advertiser_id: ''
    }
  })

  const onSubmit = async (data: AdvertisementCampaignFormData) => {
    try {
      if (editData) {
        const { error } = await supabase
          .from('advertisement_campaigns')
          .update({
            campaign_name: data.campaign_name,
            campaign_type: data.campaign_type,
            start_date: data.start_date,
            end_date: data.end_date,
            budget: data.budget,
            description: data.description,
            advertiser_id: data.advertiser_id,
            organization_id: userProfile?.organization_id
          })
          .eq('id', editData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('advertisement_campaigns')
          .insert({
            campaign_name: data.campaign_name,
            campaign_type: data.campaign_type,
            start_date: data.start_date,
            end_date: data.end_date,
            budget: data.budget,
            description: data.description,
            advertiser_id: data.advertiser_id,
            organization_id: userProfile?.organization_id
          })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Advertisement campaign ${editData ? 'updated' : 'created'} successfully`
      })

      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving advertisement campaign:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save advertisement campaign",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editData ? 'Edit' : 'Add'} Advertisement Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="campaign_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
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
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="sponsored_event">Sponsored Event</SelectItem>
                      <SelectItem value="directory">Directory</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="mobile_app">Mobile App</SelectItem>
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
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter budget" 
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editData ? 'Update' : 'Add'} Advertisement Campaign
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}