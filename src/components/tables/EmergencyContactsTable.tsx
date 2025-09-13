import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { EmergencyContactForm } from '@/components/forms/EmergencyContactForm'
import { Plus, Edit, Trash2, Phone, Shield } from 'lucide-react'

interface EmergencyContact {
  id: string
  contact_name: string
  contact_type: string
  phone_primary: string
  phone_secondary: string | null
  email: string | null
  address: string | null
  availability: string | null
  notes: string | null
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export const EmergencyContactsTable: React.FC = () => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null)

  useEffect(() => {
    fetchEmergencyContacts()
  }, [userProfile])

  const fetchEmergencyContacts = async () => {
    if (!userProfile) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('contact_name')

      if (error) throw error
      setEmergencyContacts(data || [])
    } catch (error: any) {
      console.error('Error fetching emergency contacts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load emergency contacts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedContact(null)
    fetchEmergencyContacts()
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Success', description: 'Emergency contact deleted successfully' })
      fetchEmergencyContacts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete emergency contact',
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
            <Shield className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            Manage emergency contact information for quick access during incidents
          </CardDescription>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Emergency Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
              </DialogTitle>
            </DialogHeader>
            <EmergencyContactForm
              editData={selectedContact}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false)
                setSelectedContact(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone Numbers</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emergencyContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{contact.contact_name}</div>
                    {contact.is_primary && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="capitalize">
                  {contact.contact_type.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{contact.phone_primary}</div>
                      {contact.phone_secondary && (
                        <div className="text-sm text-muted-foreground">{contact.phone_secondary}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </TableCell>
                <TableCell className="capitalize">
                  {contact.availability?.replace('_', ' ') || '24x7'}
                </TableCell>
                <TableCell>
                  <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContact(contact.id)}
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