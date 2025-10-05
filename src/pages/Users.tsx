import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserForm } from "@/components/forms/UserForm"
import { AccountSettingsForm } from "@/components/forms/AccountSettingsForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AdminPasswordForm } from "@/components/forms/AdminPasswordForm"
import { AdminEmailVerificationForm } from "@/components/forms/AdminEmailVerificationForm"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users as UsersIcon, Plus, Mail, Shield, MapPin, Edit, Trash2, Settings, Clock, Phone, Key, AlertTriangle, CheckCircle, XCircle, ChevronUp, ChevronDown, Grid, List } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Users = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isEmailVerificationDialogOpen, setIsEmailVerificationDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [passwordUser, setPasswordUser] = useState<any>(null)
  const [emailVerificationUser, setEmailVerificationUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  
  // Table filtering and sorting states
  const [filters, setFilters] = useState({
    userName: '',
    userType: '',
    emailId: '',
    status: '',
    organization: '',
    createdDate: ''
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  
  const { toast } = useToast()

  const fetchUsers = async () => {
    console.log('Fetching users...')
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        organizations(name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    } else {
      setUsers(data || [])
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    fetchUsers()
  }

  const handlePasswordSuccess = () => {
    setIsPasswordDialogOpen(false)
    setPasswordUser(null)
    fetchUsers()
  }

  const handleEmailVerificationSuccess = () => {
    setIsEmailVerificationDialogOpen(false)
    setEmailVerificationUser(null)
    fetchUsers()
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingUser.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      })
      
      fetchUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'platform_admin': return 'destructive'
      case 'franchise_admin': return 'default'
      case 'customer_admin': return 'secondary'
      default: return 'outline'
    }
  }

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'secondary'
  }

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      return (
        user.full_name?.toLowerCase().includes(filters.userName.toLowerCase()) &&
        formatRoleName(user.role).toLowerCase().includes(filters.userType.toLowerCase()) &&
        user.email?.toLowerCase().includes(filters.emailId.toLowerCase()) &&
        user.status?.toLowerCase().includes(filters.status.toLowerCase()) &&
        (user.organizations?.name || '').toLowerCase().includes(filters.organization.toLowerCase()) &&
        new Date(user.created_at).toLocaleDateString().includes(filters.createdDate)
      )
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue

        switch (sortConfig.key) {
          case 'userName':
            aValue = a.full_name || ''
            bValue = b.full_name || ''
            break
          case 'userType':
            aValue = formatRoleName(a.role)
            bValue = formatRoleName(b.role)
            break
          case 'emailId':
            aValue = a.email || ''
            bValue = b.email || ''
            break
          case 'status':
            aValue = a.status || ''
            bValue = b.status || ''
            break
          case 'organization':
            aValue = a.organizations?.name || ''
            bValue = b.organizations?.name || ''
            break
          case 'createdDate':
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [users, filters, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }))
  }

  const renderVerificationBadges = (user: any) => {
    const badges = []
    
    if (user.email_confirmed_at) {
      badges.push(
        <Badge key="verified" variant="default" className="text-xs flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      )
    } else {
      badges.push(
        <Badge key="unverified" variant="secondary" className="text-xs flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Unverified
        </Badge>
      )
    }

    if (user.two_factor_enabled) {
      badges.push(
        <Badge key="2fa" variant="secondary" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          2FA
        </Badge>
      )
    }

    if (user.active_from) {
      badges.push(
        <Badge key="scheduled" variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      )
    }

    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      badges.push(
        <Badge key="locked" variant="destructive" className="text-xs">
          Locked
        </Badge>
      )
    }

    if (user.requires_password_change) {
      badges.push(
        <Badge key="pwd-change" variant="outline" className="text-orange-600 text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Requires Password Change
        </Badge>
      )
    }

    if (user.admin_set_password) {
      badges.push(
        <Badge key="admin-pwd" variant="outline" className="text-blue-600 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Admin Set Password
        </Badge>
      )
    }

    return (
      <div className="flex flex-wrap gap-1">
        {badges}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Account Settings</DialogTitle>
              </DialogHeader>
              <AccountSettingsForm />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingUser(null)
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <UserForm onSuccess={handleSuccess} editData={editingUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Toggle Control */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'card')}>
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Table Format
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Card Format
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('userName')}
                    >
                      User Name
                      {sortConfig.key === 'userName' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by name..."
                      value={filters.userName}
                      onChange={(e) => handleFilterChange('userName', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('userType')}
                    >
                      User Type
                      {sortConfig.key === 'userType' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by type..."
                      value={filters.userType}
                      onChange={(e) => handleFilterChange('userType', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('emailId')}
                    >
                      Email ID
                      {sortConfig.key === 'emailId' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by email..."
                      value={filters.emailId}
                      onChange={(e) => handleFilterChange('emailId', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by status..."
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[250px]">
                  <div className="font-semibold">
                    Verified and other options
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('organization')}
                    >
                      Organization
                      {sortConfig.key === 'organization' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by org..."
                      value={filters.organization}
                      onChange={(e) => handleFilterChange('organization', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold justify-start"
                      onClick={() => handleSort('createdDate')}
                    >
                      Created Date
                      {sortConfig.key === 'createdDate' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Filter by date..."
                      value={filters.createdDate}
                      onChange={(e) => handleFilterChange('createdDate', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">
                  <div className="font-semibold">Actions</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRoleName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(user.status as any)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {renderVerificationBadges(user)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.organizations?.name || 'Unknown Organization'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="w-4 h-4" />
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setPasswordUser(user)
                          setIsPasswordDialogOpen(true)
                        }}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEmailVerificationUser(user)
                          setIsEmailVerificationDialogOpen(true)
                        }}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDeletingUser(user)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{user.full_name}</span>
                      <Badge variant={getStatusColor(user.status as any)}>
                        {user.status}
                      </Badge>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                      {formatRoleName(user.role)}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{user.organizations?.name || 'Unknown Organization'}</span>
                  </div>
                  {user.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="w-4 h-4" />
                    <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Verification and Security Status */}
                  {renderVerificationBadges(user)}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPasswordUser(user)
                        setIsPasswordDialogOpen(true)
                      }}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Password
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEmailVerificationUser(user)
                        setIsEmailVerificationDialogOpen(true)
                      }}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDeletingUser(user)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${deletingUser?.full_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        setIsPasswordDialogOpen(open)
        if (!open) setPasswordUser(null)
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Password Management</DialogTitle>
          </DialogHeader>
          {passwordUser && (
            <AdminPasswordForm
              user={passwordUser}
              onSuccess={handlePasswordSuccess}
              onCancel={() => setIsPasswordDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AdminEmailVerificationForm
        user={emailVerificationUser}
        open={isEmailVerificationDialogOpen}
        onOpenChange={setIsEmailVerificationDialogOpen}
        onSuccess={handleEmailVerificationSuccess}
      />
    </div>
  )
}

export default Users