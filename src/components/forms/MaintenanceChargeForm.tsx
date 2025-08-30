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

const maintenanceChargeSchema = z.object({
  unit_id: z.string().min(1, "Unit is required"),
  charge_type: z.enum(["maintenance", "utility", "amenity", "parking", "penalty", "special_assessment"]),
  amount: z.number().min(0, "Amount must be positive"),
  billing_month: z.string().min(1, "Billing month is required"),
  due_date: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "paid", "overdue", "waived"]).default("pending"),
})

type MaintenanceChargeFormData = z.infer<typeof maintenanceChargeSchema>

interface MaintenanceChargeFormProps {
  charge?: any
  units: Array<{ id: string; unit_number: string; unit_type: string }>
  onSuccess: () => void
  onCancel: () => void
}

export function MaintenanceChargeForm({ charge, units, onSuccess, onCancel }: MaintenanceChargeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<MaintenanceChargeFormData>({
    resolver: zodResolver(maintenanceChargeSchema),
    defaultValues: {
      unit_id: charge?.unit_id || "",
      charge_type: charge?.charge_type || "maintenance",
      amount: charge?.amount || 0,
      billing_month: charge?.billing_month ? new Date(charge.billing_month).toISOString().slice(0, 7) : "",
      due_date: charge?.due_date ? new Date(charge.due_date).toISOString().slice(0, 10) : "",
      description: charge?.description || "",
      status: charge?.status || "pending",
    },
  })

  const onSubmit = async (data: MaintenanceChargeFormData) => {
    setIsLoading(true)
    try {
      const chargeData = {
        unit_id: data.unit_id,
        charge_type: data.charge_type,
        amount: data.amount,
        billing_month: new Date(data.billing_month + "-01").toISOString().split('T')[0],
        due_date: data.due_date,
        description: data.description || null,
        status: data.status,
      }

      if (charge) {
        const { error } = await supabase
          .from("maintenance_charges")
          .update(chargeData)
          .eq("id", charge.id)
        
        if (error) throw error
        toast({ title: "Success", description: "Maintenance charge updated successfully" })
      } else {
        const { error } = await supabase
          .from("maintenance_charges")
          .insert([chargeData])
        
        if (error) throw error
        toast({ title: "Success", description: "Maintenance charge created successfully" })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save maintenance charge",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{charge ? "Edit Maintenance Charge" : "Add New Maintenance Charge"}</CardTitle>
        <CardDescription>
          {charge ? "Update maintenance charge information" : "Create a new maintenance charge"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unit_number} ({unit.unit_type})
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
                name="charge_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charge Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select charge type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="amenity">Amenity</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="penalty">Penalty</SelectItem>
                        <SelectItem value="special_assessment">Special Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="500.00"
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
                name="billing_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Month</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
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
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="waived">Waived</SelectItem>
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
                      placeholder="Additional details about this charge..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : charge ? "Update Charge" : "Create Charge"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}