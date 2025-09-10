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

const societyUnitSchema = z.object({
  unit_number: z.string().min(1, "Unit number is required"),
  unit_type: z.enum(["residential", "commercial", "parking"]),
  owner_name: z.string().optional(),
  tenant_name: z.string().optional(),
  area_sqft: z.number().min(0, "Area must be positive"),
  monthly_rate_per_sqft: z.number().min(0, "Rate per sqft must be positive"),
  monthly_flat_rate: z.number().min(0, "Flat rate must be positive"),
  parking_slots: z.number().min(0, "Parking slots must be positive").default(0),
  status: z.enum(["occupied", "vacant", "maintenance"]).default("occupied"),
})

type SocietyUnitFormData = z.infer<typeof societyUnitSchema>

interface SocietyUnitFormProps {
  unit?: any
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}

export function SocietyUnitForm({ unit, organizationId, onSuccess, onCancel }: SocietyUnitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<SocietyUnitFormData>({
    resolver: zodResolver(societyUnitSchema),
    defaultValues: {
      unit_number: unit?.unit_number || "",
      unit_type: unit?.unit_type || "residential",
      owner_name: unit?.owner_name || "",
      tenant_name: unit?.tenant_name || "",
      area_sqft: unit?.area_sqft || 0,
      monthly_rate_per_sqft: unit?.monthly_rate_per_sqft || 0,
      monthly_flat_rate: unit?.monthly_flat_rate || 0,
      parking_slots: unit?.parking_slots || 0,
      status: unit?.status || "occupied",
    },
  })

  const onSubmit = async (data: SocietyUnitFormData) => {
    setIsLoading(true)
    try {
      const unitData = {
        unit_number: data.unit_number,
        unit_type: data.unit_type,
        owner_name: data.owner_name || null,
        tenant_name: data.tenant_name || null,
        area_sqft: data.area_sqft,
        monthly_rate_per_sqft: data.monthly_rate_per_sqft,
        monthly_flat_rate: data.monthly_flat_rate,
        parking_slots: data.parking_slots,
        status: data.status,
        building_id: null, // Will need to be set based on the building selection
      }

      if (unit) {
        const { error } = await supabase
          .from("society_units")
          .update(unitData)
          .eq("id", unit.id)
        
        if (error) throw error
        toast({ title: "Success", description: "Unit updated successfully" })
      } else {
        const { error } = await supabase
          .from("society_units")
          .insert([unitData])
        
        if (error) throw error
        toast({ title: "Success", description: "Unit created successfully" })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save unit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{unit ? "Edit Unit" : "Add New Unit"}</CardTitle>
        <CardDescription>
          {unit ? "Update unit information" : "Create a new society unit"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="A-101" {...field} />
                    </FormControl>
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
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenant_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area_sqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1200"
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
                name="monthly_rate_per_sqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per sq ft ($)</FormLabel>
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
                name="monthly_flat_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Flat Rate ($)</FormLabel>
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
                name="parking_slots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Slots</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
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
                {isLoading ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}