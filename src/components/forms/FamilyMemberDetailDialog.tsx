import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Heart, Users, Edit, Plus, Shield } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { FamilyMemberEditForm } from "./FamilyMemberEditForm"

interface FamilyMember {
  id: string
  full_name: string
  relationship: string
  age?: number
  phone_number?: string
  email?: string
  is_emergency_contact: boolean
  created_at: string
}

interface Member {
  id: string
  full_name: string
  email: string
}

interface FamilyMemberDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onFamilyUpdated?: () => void
}

export const FamilyMemberDetailDialog: React.FC<FamilyMemberDetailDialogProps> = ({
  open,
  onOpenChange,
  member,
  onFamilyUpdated
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  const fetchFamilyMembers = async () => {
    if (!member?.id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('primary_resident_id', member.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setFamilyMembers(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch family members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && member) {
      fetchFamilyMembers()
    }
  }, [open, member])

  const handleFamilyMemberUpdated = () => {
    fetchFamilyMembers()
    onFamilyUpdated?.()
    setEditingMember(null)
    setShowAddForm(false)
  }

  const handleDeleteFamilyMember = async (familyMember: FamilyMember) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', familyMember.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Family member removed successfully",
      })
      
      handleFamilyMemberUpdated()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove family member",
        variant: "destructive",
      })
    }
  }

  const getRelationshipBadgeVariant = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'spouse':
        return 'default'
      case 'son':
      case 'daughter':
        return 'secondary'
      case 'father':
      case 'mother':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (!member) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Members - {member.full_name}
            </DialogTitle>
            <DialogDescription>
              View and manage family members for this society member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''}
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Family Member
              </Button>
            </div>

            <Separator />

            {/* Family Members List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading family members...</p>
              </div>
            ) : familyMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Family Members</h3>
                <p className="text-muted-foreground mb-4">
                  Add family members to keep track of household information
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Family Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyMembers.map((familyMember) => (
                  <Card key={familyMember.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{familyMember.full_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getRelationshipBadgeVariant(familyMember.relationship)}>
                              {familyMember.relationship}
                            </Badge>
                            {familyMember.is_emergency_contact && (
                              <Badge variant="destructive" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Emergency Contact
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(familyMember)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {familyMember.age && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Age:</span> {familyMember.age}
                        </div>
                      )}
                      
                      {familyMember.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{familyMember.phone_number}</span>
                        </div>
                      )}
                      
                      {familyMember.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{familyMember.email}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(familyMember.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFamilyMember(familyMember)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Family Member Dialog */}
      <FamilyMemberEditForm
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        familyMember={editingMember}
        primaryResidentId={member.id}
        onSuccess={handleFamilyMemberUpdated}
      />

      {/* Add Family Member Dialog */}
      <FamilyMemberEditForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        familyMember={null}
        primaryResidentId={member.id}
        onSuccess={handleFamilyMemberUpdated}
      />
    </>
  )
}