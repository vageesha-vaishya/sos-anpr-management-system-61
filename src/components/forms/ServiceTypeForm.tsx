import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const serviceTypeSchema = z.object({
  service_name: z.string().min(2, "Service name must be at least 2 characters"),
  service_category: z.string().min(1, "Service category is required"),
  description: z.string().optional(),
  unit_type: z.string().min(1, "Unit type is required"),
  default_rate: z.number().min(0, "Rate must be positive"),
  billing_model: z.string().min(1, "Billing model is required"),
  is_active: z.boolean().default(true)
})

type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>

interface ServiceTypeFormProps {
  serviceType?: any
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ServiceTypeForm({ serviceType, organizationId, onSuccess, onCancel }: ServiceTypeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ServiceTypeFormData>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      service_name: serviceType?.service_name || "",
      service_category: serviceType?.service_category || "",
      description: serviceType?.description || "",
      unit_type: serviceType?.unit_type || "",
      default_rate: serviceType?.default_rate || 0,
      billing_model: serviceType?.billing_model || "usage_based",
      is_active: serviceType?.is_active ?? true
    }
  })

  const onSubmit = async (data: ServiceTypeFormData) => {
    try {
      setLoading(true)

      const payload = {
        service_name: data.service_name,
        service_category: data.service_category,
        description: data.description,
        unit_type: data.unit_type,
        default_rate: data.default_rate,
        billing_model: data.billing_model,
        is_active: data.is_active,
        organization_id: organizationId
      }

      let error
      if (serviceType) {
        const { error: updateError } = await supabase
          .from("service_types")
          .update(payload)
          .eq("id", serviceType.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("service_types")
          .insert(payload)
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Service type ${serviceType ? "updated" : "created"} successfully`
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save service type",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{serviceType ? "Edit" : "Add"} Service Type</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="service_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ANPR Detection, Security Guard..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="anpr">ANPR Services</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="landscaping">Landscaping</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="per_detection">Per Detection</SelectItem>
                        <SelectItem value="per_camera">Per Camera</SelectItem>
                        <SelectItem value="per_hour">Per Hour</SelectItem>
                        <SelectItem value="per_day">Per Day</SelectItem>
                        <SelectItem value="per_month">Per Month</SelectItem>
                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                        <SelectItem value="per_unit">Per Unit</SelectItem>
                        <SelectItem value="per_sqft">Per Square Foot</SelectItem>
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
                        <SelectItem value="usage_based">Usage Based</SelectItem>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="tiered">Tiered Pricing</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description of the service type..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Service</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this service type for billing
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : serviceType ? "Update Service Type" : "Create Service Type"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}