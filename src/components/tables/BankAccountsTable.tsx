import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { BankAccountForm } from '@/components/forms/BankAccountForm'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'

interface BankAccount {
  id: string
  account_name: string
  account_number: string
  bank_name: string
  branch_name: string | null
  ifsc_code: string | null
  account_type: string
  opening_balance: number
  current_balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const BankAccountsTable: React.FC = () => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  useEffect(() => {
    fetchBankAccounts()
  }, [userProfile])

  const fetchBankAccounts = async () => {
    if (!userProfile) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('account_name')

      if (error) throw error
      setBankAccounts(data || [])
    } catch (error: any) {
      console.error('Error fetching bank accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load bank accounts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedAccount(null)
    fetchBankAccounts()
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Success', description: 'Bank account deleted successfully' })
      fetchBankAccounts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete bank account',
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
            <DollarSign className="h-5 w-5" />
            Bank Accounts
          </CardTitle>
          <CardDescription>
            Manage organization bank accounts and financial information
          </CardDescription>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </DialogTitle>
            </DialogHeader>
            <BankAccountForm
              editData={selectedAccount}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false)
                setSelectedAccount(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Bank & Branch</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.account_name}</TableCell>
                <TableCell className="font-mono">{account.account_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{account.bank_name}</div>
                    {account.branch_name && (
                      <div className="text-sm text-muted-foreground">{account.branch_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{account.account_type}</TableCell>
                <TableCell className="text-right font-medium">
                  ${account.current_balance?.toLocaleString() || '0.00'}
                </TableCell>
                <TableCell>
                  <Badge variant={account.is_active ? 'default' : 'secondary'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(account)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAccount(account.id)}
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