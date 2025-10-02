import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const familyMemberSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  age: z.number().min(0, "Age must be positive").optional(),
  phone_number: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  is_emergency_contact: z.boolean().default(false),
})

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>

interface FamilyMember {
  id: string
  full_name: string
  relationship: string
  age?: number
  phone_number?: string
  email?: string
  is_emergency_contact: boolean
}

interface FamilyMemberEditFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familyMember: FamilyMember | null
  primaryResidentId: string
  onSuccess?: () => void
}

export const FamilyMemberEditForm: React.FC<FamilyMemberEditFormProps> = ({
  open,
  onOpenChange,
  familyMember,
  primaryResidentId,
  onSuccess
}) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  
  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      full_name: familyMember?.full_name || "",
      relationship: familyMember?.relationship || "",
      age: familyMember?.age || undefined,
      phone_number: familyMember?.phone_number || "",
      email: familyMember?.email || "",
      is_emergency_contact: familyMember?.is_emergency_contact || false,
    },
  })

  // Reset form when familyMember changes
  React.useEffect(() => {
    if (familyMember) {
      form.reset({
        full_name: familyMember.full_name,
        relationship: familyMember.relationship,
        age: familyMember.age || undefined,
        phone_number: familyMember.phone_number || "",
        email: familyMember.email || "",
        is_emergency_contact: familyMember.is_emergency_contact,
      })
    } else {
      form.reset({
        full_name: "",
        relationship: "",
        age: undefined,
        phone_number: "",
        email: "",
        is_emergency_contact: false,
      })
    }
  }, [familyMember, form])

  const onSubmit = async (data: FamilyMemberFormData) => {
    try {
      // Validate organization_id exists
      if (!userProfile?.organization_id) {
        toast({
          title: "Error",
          description: "Unable to determine organization. Please refresh and try again.",
          variant: "destructive",
        })
        return
      }

      const familyMemberData = {
        full_name: data.full_name,
        relationship: data.relationship,
        primary_resident_id: primaryResidentId,
        organization_id: userProfile.organization_id,
        email: data.email || null,
        phone_number: data.phone_number || null,
        age: data.age || null,
        is_emergency_contact: data.is_emergency_contact,
      }

      if (familyMember) {
        // Update existing family member
        const { error } = await supabase
          .from('household_members')
          .update(familyMemberData)
          .eq('id', familyMember.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Family member updated successfully",
        })
      } else {
        // Create new family member
        const { error } = await supabase
          .from('household_members')
          .insert(familyMemberData)

        if (error) throw error

        toast({
          title: "Success",
          description: "Family member added successfully",
        })
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Family member operation failed:', error)
      toast({
        title: "Error",
        description: error.message || (familyMember 
          ? "Failed to update family member" 
          : "Failed to add family member"),
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {familyMember ? "Edit Family Member" : "Add Family Member"}
          </DialogTitle>
          <DialogDescription>
            {familyMember 
              ? "Update the family member information below" 
              : "Add a new family member to this household"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Grandparent">Grandparent</SelectItem>
                      <SelectItem value="Grandchild">Grandchild</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Age" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_emergency_contact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Emergency Contact</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this person as an emergency contact
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {familyMember ? "Update" : "Add"} Family Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}