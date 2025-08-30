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

const chargeCategorySchema = z.object({
  category_name: z.string().min(2, "Category name must be at least 2 characters"),
  category_type: z.string().min(1, "Category type is required"),
  description: z.string().optional(),
  default_amount: z.number().min(0, "Amount must be positive"),
  billing_frequency: z.string().min(1, "Billing frequency is required"),
  is_mandatory: z.boolean().default(true),
  is_active: z.boolean().default(true)
})

type ChargeCategoryFormData = z.infer<typeof chargeCategorySchema>

interface ChargeCategoryFormProps {
  category?: any
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ChargeCategoryForm({ category, organizationId, onSuccess, onCancel }: ChargeCategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ChargeCategoryFormData>({
    resolver: zodResolver(chargeCategorySchema),
    defaultValues: {
      category_name: category?.category_name || "",
      category_type: category?.category_type || "",
      description: category?.description || "",
      default_amount: category?.default_amount || 0,
      billing_frequency: category?.billing_frequency || "monthly",
      is_mandatory: category?.is_mandatory ?? true,
      is_active: category?.is_active ?? true
    }
  })

  const onSubmit = async (data: ChargeCategoryFormData) => {
    try {
      setLoading(true)

      const payload = {
        category_name: data.category_name,
        category_type: data.category_type,
        description: data.description,
        default_amount: data.default_amount,
        billing_frequency: data.billing_frequency,
        is_mandatory: data.is_mandatory,
        is_active: data.is_active,
        organization_id: organizationId
      }

      let error
      if (category) {
        const { error: updateError } = await supabase
          .from("charge_categories")
          .update(payload)
          .eq("id", category.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("charge_categories")
          .insert(payload)
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Charge category ${category ? "updated" : "created"} successfully`
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save charge category",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Edit" : "Add"} Charge Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Maintenance, Utility, Security..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="amenity">Amenity</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="penalty">Penalty</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Amount ($)</FormLabel>
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
                name="billing_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi_annually">Semi-Annually</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="Description of the charge category..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_mandatory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mandatory Charge</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        This charge is required for all units
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

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Category</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this charge category
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}