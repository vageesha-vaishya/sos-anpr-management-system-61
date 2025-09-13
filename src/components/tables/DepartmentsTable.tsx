import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { DepartmentForm } from '@/components/forms/DepartmentForm'
import { Plus, Edit, Trash2, Building } from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string | null
  head_of_department: string | null
  budget: number | null
  status: string
  created_at: string
  updated_at: string
}

export const DepartmentsTable: React.FC = () => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [userProfile])

  const fetchDepartments = async () => {
    if (!userProfile) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load departments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedDepartment(null)
    fetchDepartments()
  }

  const deleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Success', description: 'Department deleted successfully' })
      fetchDepartments()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete department',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Departments
          </CardTitle>
          <CardDescription>
            Manage organizational departments and their structure
          </CardDescription>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDepartment ? 'Edit Department' : 'Add New Department'}
              </DialogTitle>
            </DialogHeader>
            <DepartmentForm
              editData={selectedDepartment}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false)
                setSelectedDepartment(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Head of Department</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{department.name}</div>
                    {department.description && (
                      <div className="text-sm text-muted-foreground">{department.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{department.head_of_department || 'Not assigned'}</TableCell>
                <TableCell className="text-right">
                  {department.budget ? `$${department.budget.toLocaleString()}` : 'Not set'}
                </TableCell>
                <TableCell>
                  <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
                    {department.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDepartment(department)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDepartment(department.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}