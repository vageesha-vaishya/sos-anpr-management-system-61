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

const amenitySchema = z.object({
  amenity_name: z.string().min(2, "Amenity name must be at least 2 characters"),
  amenity_type: z.string().min(1, "Amenity type is required"),
  description: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  hourly_rate: z.number().min(0, "Hourly rate must be positive"),
  advance_booking_days: z.number().min(1, "Must be at least 1 day"),
  max_booking_hours: z.number().min(1, "Must be at least 1 hour"),
  maintenance_schedule: z.string().optional(),
  is_active: z.boolean().default(true)
})

type AmenityFormData = z.infer<typeof amenitySchema>

interface AmenityFormProps {
  amenity?: any
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AmenityForm({ amenity, organizationId, onSuccess, onCancel }: AmenityFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<AmenityFormData>({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      amenity_name: amenity?.amenity_name || "",
      amenity_type: amenity?.amenity_type || "",
      description: amenity?.description || "",
      capacity: amenity?.capacity || 1,
      hourly_rate: amenity?.hourly_rate || 0,
      advance_booking_days: amenity?.advance_booking_days || 7,
      max_booking_hours: amenity?.max_booking_hours || 4,
      maintenance_schedule: amenity?.maintenance_schedule || "",
      is_active: amenity?.is_active ?? true
    }
  })

  const onSubmit = async (data: AmenityFormData) => {
    try {
      setLoading(true)

      const payload = {
        amenity_name: data.amenity_name,
        amenity_type: data.amenity_type,
        description: data.description,
        capacity: data.capacity,
        hourly_rate: data.hourly_rate,
        advance_booking_days: data.advance_booking_days,
        max_booking_hours: data.max_booking_hours,
        maintenance_schedule: data.maintenance_schedule,
        is_active: data.is_active,
        organization_id: organizationId,
        booking_rules: {}
      }

      let error
      if (amenity) {
        const { error: updateError } = await supabase
          .from("amenities")
          .update(payload)
          .eq("id", amenity.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("amenities")
          .insert(payload)
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Amenity ${amenity ? "updated" : "created"} successfully`
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save amenity",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{amenity ? "Edit" : "Add"} Amenity</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amenity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Swimming Pool, Gym, Clubhouse..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amenity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clubhouse">Clubhouse</SelectItem>
                        <SelectItem value="gym">Gym</SelectItem>
                        <SelectItem value="pool">Swimming Pool</SelectItem>
                        <SelectItem value="playground">Playground</SelectItem>
                        <SelectItem value="tennis_court">Tennis Court</SelectItem>
                        <SelectItem value="basketball_court">Basketball Court</SelectItem>
                        <SelectItem value="party_hall">Party Hall</SelectItem>
                        <SelectItem value="conference_room">Conference Room</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="garden">Garden Area</SelectItem>
                        <SelectItem value="parking">Guest Parking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (persons)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="50" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="25.00" 
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
                name="advance_booking_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Booking (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="7" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_booking_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Booking Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="4" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
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
                      placeholder="Description of the amenity, rules, facilities available..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenance_schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Schedule</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Daily maintenance from 6-8 AM, Weekly deep cleaning on Sundays..."
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
                    <FormLabel className="text-base">Active Amenity</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this amenity for booking
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
                {loading ? "Saving..." : amenity ? "Update Amenity" : "Create Amenity"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}