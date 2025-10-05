import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { StaffForm } from '@/components/forms/StaffForm'
import { DepartmentForm } from '@/components/forms/DepartmentForm'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Building2, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Plus,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Grid3X3
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface StaffMember {
  id: string
  employee_id: string
  full_name: string
  email: string
  phone: string
  position: string
  salary: number
  hire_date: string
  is_active: boolean
  department: {
    name: string
  }
}

interface Department {
  id: string
  name: string
  description: string
  head_of_department: string
  budget: number
  is_active: boolean
  staff_count: number
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [filters, setFilters] = useState({
    employeeId: '',
    fullName: '',
    position: '',
    department: '',
    email: '',
    status: ''
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StaffMember | 'department.name' | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  
  // Department-specific state
  const [departmentViewMode, setDepartmentViewMode] = useState<'table' | 'card'>('card')
  const [departmentFilters, setDepartmentFilters] = useState({
    name: '',
    description: '',
    head_of_department: '',
    budget: '',
    status: ''
  })
  const [departmentSortConfig, setDepartmentSortConfig] = useState<{
    key: keyof Department | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  
  const { toast } = useToast()

  const loadStaff = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('staff_members')
        .select(`
          *,
          department:departments(name)
        `)
        .order('full_name')

      if (error) throw error
      setStaff(data as any || [])
    } catch (error) {
      console.error('Error loading staff:', error)
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      })
    }
  }

  const loadDepartments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error

      // Get staff count for each department
      const departmentsWithCount = await Promise.all(
        (data || []).map(async (dept) => {
          const { count } = await (supabase as any)
            .from('staff_members')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .eq('is_active', true)

          return {
            ...dept,
            staff_count: count || 0
          }
        })
      )

      setDepartments(departmentsWithCount)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load departments',
        variant: 'destructive',
      })
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadStaff(), loadDepartments()])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteStaff = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('staff_members')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Staff member deleted successfully',
      })
      loadStaff()
    } catch (error: any) {
      console.error('Error deleting staff:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete staff member',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      })
      loadDepartments()
    } catch (error: any) {
      console.error('Error deleting department:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete department',
        variant: 'destructive',
      })
    }
  }

  // Enhanced filtering and sorting logic for staff
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff.filter(member => {
      const matchesEmployeeId = member.employee_id.toLowerCase().includes(filters.employeeId.toLowerCase())
      const matchesFullName = member.full_name.toLowerCase().includes(filters.fullName.toLowerCase())
      const matchesPosition = member.position.toLowerCase().includes(filters.position.toLowerCase())
      const matchesDepartment = (member.department?.name || '').toLowerCase().includes(filters.department.toLowerCase())
      const matchesEmail = member.email.toLowerCase().includes(filters.email.toLowerCase())
      const matchesStatus = filters.status === '' || 
        (filters.status === 'active' && member.is_active) || 
        (filters.status === 'inactive' && !member.is_active)

      return matchesEmployeeId && matchesFullName && matchesPosition && 
             matchesDepartment && matchesEmail && matchesStatus
    })

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        if (sortConfig.key === 'department.name') {
          aValue = a.department?.name || ''
          bValue = b.department?.name || ''
        } else {
          aValue = a[sortConfig.key as keyof StaffMember]
          bValue = b[sortConfig.key as keyof StaffMember]
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [staff, filters, sortConfig])

  const handleSort = (key: keyof StaffMember | 'department.name') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Enhanced filtering and sorting logic for departments
  const filteredAndSortedDepartments = useMemo(() => {
    let filtered = departments.filter(dept => {
      const matchesName = dept.name.toLowerCase().includes(departmentFilters.name.toLowerCase())
      const matchesDescription = (dept.description || '').toLowerCase().includes(departmentFilters.description.toLowerCase())
      const matchesHead = (dept.head_of_department || '').toLowerCase().includes(departmentFilters.head_of_department.toLowerCase())
      const matchesBudget = departmentFilters.budget === '' || 
        dept.budget.toString().includes(departmentFilters.budget)
      const matchesStatus = departmentFilters.status === '' || 
        (departmentFilters.status === 'active' && dept.is_active) || 
        (departmentFilters.status === 'inactive' && !dept.is_active)

      return matchesName && matchesDescription && matchesHead && matchesBudget && matchesStatus
    })

    // Apply sorting
    if (departmentSortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[departmentSortConfig.key as keyof Department]
        const bValue = b[departmentSortConfig.key as keyof Department]

        if (aValue < bValue) return departmentSortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return departmentSortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [departments, departmentFilters, departmentSortConfig])

  const handleDepartmentSort = (key: keyof Department) => {
    setDepartmentSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDepartmentFilterChange = (key: keyof typeof departmentFilters, value: string) => {
    setDepartmentFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredStaff = staff.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members and departments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.filter(s => s.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.filter(d => d.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${departments.reduce((sum, dept) => sum + (dept.budget || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined department budgets
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <StaffForm onSuccess={loadStaff} />
          </div>

          {/* View Toggle Control */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'card')} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table Format
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Card Format
              </TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('employee_id')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Employee ID
                              {sortConfig.key === 'employee_id' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Employee ID..."
                              value={filters.employeeId}
                              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('full_name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Full Name
                              {sortConfig.key === 'full_name' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Name..."
                              value={filters.fullName}
                              onChange={(e) => handleFilterChange('fullName', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('position')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Position
                              {sortConfig.key === 'position' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Position..."
                              value={filters.position}
                              onChange={(e) => handleFilterChange('position', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('department.name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Department
                              {sortConfig.key === 'department.name' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Department..."
                              value={filters.department}
                              onChange={(e) => handleFilterChange('department', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('email')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Email
                              {sortConfig.key === 'email' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Email..."
                              value={filters.email}
                              onChange={(e) => handleFilterChange('email', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('is_active')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Status
                              {sortConfig.key === 'is_active' && (
                                sortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <select
                              value={filters.status}
                              onChange={(e) => handleFilterChange('status', e.target.value)}
                              className="h-8 w-full rounded border border-input bg-background px-3 py-1 text-sm"
                            >
                              <option value="">All Status</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.employee_id}</TableCell>
                          <TableCell>{member.full_name}</TableCell>
                          <TableCell>{member.position}</TableCell>
                          <TableCell>{member.department?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{member.email}</div>
                              <div className="text-muted-foreground">{member.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.is_active ? 'default' : 'secondary'}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <StaffForm
                                  staff={member}
                                  onSuccess={loadStaff}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  }
                                />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteStaff(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAndSortedStaff.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No staff members found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Card View */}
            <TabsContent value="card" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedStaff.map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{member.full_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.employee_id}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <StaffForm
                              staff={member}
                              onSuccess={loadStaff}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStaff(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Position:</span>
                          <span className="text-sm">{member.position}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Department:</span>
                          <span className="text-sm">{member.department?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm">{member.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Phone:</span>
                          <span className="text-sm">{member.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Salary:</span>
                          <span className="text-sm font-medium">
                            ${(member.salary || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Hire Date:</span>
                          <span className="text-sm">
                            {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredAndSortedStaff.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No staff members found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <DepartmentForm onSuccess={loadDepartments} />
          </div>

          {/* View Toggle Control */}
          <Tabs value={departmentViewMode} onValueChange={(value) => setDepartmentViewMode(value as 'table' | 'card')} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table Format
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Card Format
              </TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleDepartmentSort('name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Department Name
                              {departmentSortConfig.key === 'name' && (
                                departmentSortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Name..."
                              value={departmentFilters.name}
                              onChange={(e) => handleDepartmentFilterChange('name', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleDepartmentSort('description')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Description
                              {departmentSortConfig.key === 'description' && (
                                departmentSortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Description..."
                              value={departmentFilters.description}
                              onChange={(e) => handleDepartmentFilterChange('description', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleDepartmentSort('head_of_department')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Head of Department
                              {departmentSortConfig.key === 'head_of_department' && (
                                departmentSortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Head..."
                              value={departmentFilters.head_of_department}
                              onChange={(e) => handleDepartmentFilterChange('head_of_department', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleDepartmentSort('budget')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Budget
                              {departmentSortConfig.key === 'budget' && (
                                departmentSortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <Input
                              placeholder="Filter by Budget..."
                              value={departmentFilters.budget}
                              onChange={(e) => handleDepartmentFilterChange('budget', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleDepartmentSort('is_active')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Status
                              {departmentSortConfig.key === 'is_active' && (
                                departmentSortConfig.direction === 'asc' ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                            <select
                              value={departmentFilters.status}
                              onChange={(e) => handleDepartmentFilterChange('status', e.target.value)}
                              className="h-8 w-full rounded border border-input bg-background px-3 py-1 text-sm"
                            >
                              <option value="">All Status</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedDepartments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {department.description || 'N/A'}
                          </TableCell>
                          <TableCell>{department.head_of_department || 'N/A'}</TableCell>
                          <TableCell className="font-medium">
                            ${(department.budget || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={department.is_active ? 'default' : 'secondary'}>
                              {department.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DepartmentForm
                                  department={department}
                                  onSuccess={loadDepartments}
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  }
                                />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteDepartment(department.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredAndSortedDepartments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No departments found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Card View */}
            <TabsContent value="card" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedDepartments.map((department) => (
                  <Card key={department.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{department.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {department.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Head:</span>
                          <span className="text-sm">{department.head_of_department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Staff:</span>
                          <Badge variant="outline">{department.staff_count}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Budget:</span>
                          <span className="text-sm font-medium">
                            ${(department.budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={department.is_active ? 'default' : 'secondary'}>
                            {department.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredAndSortedDepartments.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No departments found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}