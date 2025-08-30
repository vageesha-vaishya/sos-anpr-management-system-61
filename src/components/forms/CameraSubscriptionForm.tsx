import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cameraSubscriptionSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  camera_id: z.string().min(1, "Camera is required"),
  subscription_plan: z.enum(["basic", "professional", "enterprise"]),
  monthly_fee: z.number().min(0, "Monthly fee must be positive"),
  installation_fee: z.number().min(0, "Installation fee must be positive").default(0),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  auto_renew: z.boolean().default(true),
  status: z.enum(["pending", "active", "suspended", "cancelled"]).default("active"),
})

type CameraSubscriptionFormData = z.infer<typeof cameraSubscriptionSchema>

interface CameraSubscriptionFormProps {
  subscription?: any
  customers: Array<{ id: string; billing_name: string }>
  cameras: Array<{ id: string; name: string; location: string }>
  onSuccess: () => void
  onCancel: () => void
}

export function CameraSubscriptionForm({ 
  subscription, 
  customers, 
  cameras, 
  onSuccess, 
  onCancel 
}: CameraSubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Subscription plan pricing
  const planPricing = {
    basic: 99,
    professional: 199,
    enterprise: 399,
  }

  const form = useForm<CameraSubscriptionFormData>({
    resolver: zodResolver(cameraSubscriptionSchema),
    defaultValues: {
      customer_id: subscription?.customer_id || "",
      camera_id: subscription?.camera_id || "",
      subscription_plan: subscription?.subscription_plan || "basic",
      monthly_fee: subscription?.monthly_fee || planPricing.basic,
      installation_fee: subscription?.installation_fee || 0,
      start_date: subscription?.start_date ? new Date(subscription.start_date).toISOString().slice(0, 10) : "",
      end_date: subscription?.end_date ? new Date(subscription.end_date).toISOString().slice(0, 10) : "",
      auto_renew: subscription?.auto_renew !== undefined ? subscription.auto_renew : true,
      status: subscription?.status || "active",
    },
  })

  const watchedPlan = form.watch("subscription_plan")

  // Update monthly fee when plan changes
  const handlePlanChange = (plan: "basic" | "professional" | "enterprise") => {
    form.setValue("monthly_fee", planPricing[plan])
  }

  const onSubmit = async (data: CameraSubscriptionFormData) => {
    setIsLoading(true)
    try {
      const subscriptionData = {
        customer_id: data.customer_id,
        camera_id: data.camera_id,
        subscription_plan: data.subscription_plan,
        monthly_fee: data.monthly_fee,
        installation_fee: data.installation_fee,
        start_date: data.start_date,
        end_date: data.end_date || null,
        auto_renew: data.auto_renew,
        status: data.status,
        features: {
          plan: data.subscription_plan,
          cameras_included: data.subscription_plan === "basic" ? 5 : data.subscription_plan === "professional" ? 15 : 999,
          analytics: data.subscription_plan !== "basic",
          api_access: data.subscription_plan === "enterprise",
          storage_gb: data.subscription_plan === "basic" ? 10 : data.subscription_plan === "professional" ? 50 : 500,
        }
      }

      if (subscription) {
        const { error } = await supabase
          .from("camera_subscriptions")
          .update(subscriptionData)
          .eq("id", subscription.id)
        
        if (error) throw error
        toast({ title: "Success", description: "Camera subscription updated successfully" })
      } else {
        const { error } = await supabase
          .from("camera_subscriptions")
          .insert([subscriptionData])
        
        if (error) throw error
        toast({ title: "Success", description: "Camera subscription created successfully" })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save camera subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{subscription ? "Edit Camera Subscription" : "Create New Camera Subscription"}</CardTitle>
        <CardDescription>
          {subscription ? "Update camera subscription details" : "Create a new ANPR camera subscription"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.billing_name}
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
                name="camera_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cameras.map((camera) => (
                          <SelectItem key={camera.id} value={camera.id}>
                            {camera.name} - {camera.location}
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
                name="subscription_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        handlePlanChange(value as "basic" | "professional" | "enterprise")
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $99/month (up to 5 cameras)</SelectItem>
                        <SelectItem value="professional">Professional - $199/month (up to 15 cameras)</SelectItem>
                        <SelectItem value="enterprise">Enterprise - $399/month (unlimited cameras)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Fee ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
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
                name="installation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Fee ($)</FormLabel>
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
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <FormLabel>Auto Renewal</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Automatically renew this subscription monthly
                </p>
              </div>
              <FormField
                control={form.control}
                name="auto_renew"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Plan Features */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Plan Features</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                {watchedPlan === "basic" && (
                  <>
                    <p>• Up to 5 cameras</p>
                    <p>• 10GB storage</p>
                    <p>• Basic detection features</p>
                    <p>• Email support</p>
                  </>
                )}
                {watchedPlan === "professional" && (
                  <>
                    <p>• Up to 15 cameras</p>
                    <p>• 50GB storage</p>
                    <p>• Advanced analytics</p>
                    <p>• Priority support</p>
                  </>
                )}
                {watchedPlan === "enterprise" && (
                  <>
                    <p>• Unlimited cameras</p>
                    <p>• 500GB storage</p>
                    <p>• Premium analytics</p>
                    <p>• API access</p>
                    <p>• 24/7 dedicated support</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : subscription ? "Update Subscription" : "Create Subscription"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}