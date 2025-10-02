import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { SocietyMemberForm } from '@/components/forms/SocietyMemberForm'
import { SocietyUnitsTable } from '@/components/tables/SocietyUnitsTable'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Home, 
  Phone, 
  Mail, 
  Shield, 
  Clock,
  Heart,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Building2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { FamilyMemberDetailDialog } from '@/components/forms/FamilyMemberDetailDialog'

interface Member {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  phone_number?: string
  last_login?: string
  unit_number?: string
  assignment_type?: string
  family_count?: number
}

interface SocietyUnit {
  id: string;
  unit_number: string;
  unit_type?: string | null;
  owner_name?: string | null;
  tenant_name?: string | null;
  area_sqft?: number | null;
  monthly_rate_per_sqft?: number | null;
  monthly_flat_rate?: number | null;
  parking_slots?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

const SocietyMemberManagement = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [units, setUnits] = useState<SocietyUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [viewingFamilyMember, setViewingFamilyMember] = useState<Member | null>(null)
  const [activeTab, setActiveTab] = useState('members')
  const { toast } = useToast()
  const { userProfile } = useAuth()

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Fetch members with unit assignments
      const { data: membersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          status,
          phone,
          last_login,
          unit_assignments!left (
            unit_id,
            assignment_type,
            society_units!left (
              unit_number
            )
          ),
          household_members!primary_resident_id (
            id
          )
        `)
        .eq('organization_id', userProfile?.organization_id)
        .in('role', ['society_president', 'society_secretary', 'society_treasurer', 'society_committee_member', 'resident', 'tenant', 'owner', 'family_member'])
        .order('full_name')

      if (error) throw error

      // Transform data to include unit info and family count
      const transformedMembers = membersData?.map((member: any) => ({
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        role: member.role,
        status: member.status,
        phone_number: member.phone,
        last_login: member.last_login,
        unit_number: member.unit_assignments?.[0]?.society_units?.unit_number,
        assignment_type: member.unit_assignments?.[0]?.assignment_type,
        family_count: member.household_members?.length || 0,
      })) || []

      setMembers(transformedMembers)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch society members',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      setUnitsLoading(true)
      
      const { data: unitsData, error } = await supabase
        .from('society_units')
        .select(`
          id,
          building_id,
          floor,
          unit_number,
          unit_type,
          owner_name,
          tenant_name,
          area_sqft,
          monthly_rate_per_sqft,
          monthly_flat_rate,
          parking_slots,
          status,
          created_at,
          updated_at,
          buildings (
            name
          )
        `)
        .order('unit_number')

      if (error) throw error

      setUnits(unitsData || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch society units',
        variant: 'destructive',
      })
    } finally {
      setUnitsLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchMembers()
      fetchUnits()
    }
  }, [userProfile?.organization_id])

  const handleSuccess = () => {
    setShowAddDialog(false)
    setEditingMember(null)
    fetchMembers()
  }

  const handleFamilyUpdated = () => {
    fetchMembers()
  }

  const handleEdit = async (member: Member) => {
    try {
      // Fetch complete member data including unit and family details
      const { data: completeData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          status,
          phone,
          unit_assignments!left (
            unit_id,
            assignment_type,
            society_units!left (
              id,
              unit_number,
              building_id
            )
          ),
          household_members!primary_resident_id (
            id,
            full_name,
            relationship,
            age,
            phone_number,
            email,
            is_emergency_contact
          )
        `)
        .eq('id', member.id)
        .single()

      if (error) throw error

      // Transform to match form expectations
      const editData = {
        ...completeData,
        unit_id: completeData.unit_assignments?.[0]?.society_units?.id,
        building_id: completeData.unit_assignments?.[0]?.society_units?.building_id,
        assignment_type: completeData.unit_assignments?.[0]?.assignment_type,
        family_members: completeData.household_members || [],
      }

      setEditingMember(editData)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load member details',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', member.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      })
      
      fetchMembers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      })
    } finally {
      setDeletingMember(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'society_president': return 'destructive'
      case 'society_secretary': return 'default'
      case 'society_treasurer': return 'secondary'
      case 'society_committee_member': return 'outline'
      case 'owner': return 'default'
      case 'tenant': return 'secondary'
      case 'resident': return 'outline'
      case 'family_member': return 'outline'
      default: return 'outline'
    }
  }

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'inactive': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.unit_number && member.unit_number.includes(searchTerm))
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    return matchesSearch && matchesRole
  })

  const memberStats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    officials: members.filter(m => m.role.includes('society_')).length,
    residents: members.filter(m => ['resident', 'owner', 'tenant'].includes(m.role)).length,
  }

  const unitStats = {
    total: units.length,
    occupied: units.filter(u => u.status === 'occupied').length,
    vacant: units.filter(u => u.status === 'vacant').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
  }

  if (loading || unitsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Society Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage society members, units, committees, and assignments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Society Member</DialogTitle>
                <DialogDescription>
                  Register a new member with unit assignment and family details
                </DialogDescription>
              </DialogHeader>
              <SocietyMemberForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Member Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold">{memberStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    <p className="text-3xl font-bold text-green-600">{memberStats.active}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Committee Members</p>
                    <p className="text-3xl font-bold text-blue-600">{memberStats.officials}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Residents</p>
                    <p className="text-3xl font-bold text-purple-600">{memberStats.residents}</p>
                  </div>
                  <Home className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search members by name, email, or unit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Roles</option>
                    <option value="society_president">President</option>
                    <option value="society_secretary">Secretary</option>
                    <option value="society_treasurer">Treasurer</option>
                    <option value="society_committee_member">Committee</option>
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                    <option value="resident">Resident</option>
                    <option value="family_member">Family Member</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{member.full_name}</h3>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {formatRoleName(member.role)}
                      </Badge>
                      <div className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                        ● {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingMember(member)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  {member.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{member.phone_number}</span>
                    </div>
                  )}
                  
                  {member.unit_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span>Unit {member.unit_number} ({member.assignment_type})</span>
                    </div>
                  )}
                  
                  {member.family_count > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span>{member.family_count} family member{member.family_count !== 1 ? 's' : ''}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingFamilyMember(member)}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  )}
                  
                  {member.last_login && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Last seen: {new Date(member.last_login).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first society member'
                  }
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          {/* Unit Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                    <p className="text-3xl font-bold">{unitStats.total}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                    <p className="text-3xl font-bold text-green-600">{unitStats.occupied}</p>
                  </div>
                  <Home className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vacant</p>
                    <p className="text-3xl font-bold text-blue-600">{unitStats.vacant}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                    <p className="text-3xl font-bold text-red-600">{unitStats.maintenance}</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Units Table */}
          <SocietyUnitsTable units={units} onRefresh={fetchUnits} organizationId={userProfile?.organization_id} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Society Member</DialogTitle>
            <DialogDescription>
              Update member information and unit assignment
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <SocietyMemberForm 
              editData={editingMember} 
              onSuccess={handleSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingMember}
        onOpenChange={() => setDeletingMember(null)}
        onConfirm={() => deletingMember && handleDelete(deletingMember)}
        title="Delete Member"
        description={`Are you sure you want to delete ${deletingMember?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Family Member Detail Dialog */}
      <FamilyMemberDetailDialog
        open={!!viewingFamilyMember}
        onOpenChange={() => setViewingFamilyMember(null)}
        member={viewingFamilyMember}
        onFamilyUpdated={handleFamilyUpdated}
      />
    </div>
  )
}

export default SocietyMemberManagement