import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  branch_name: z.string().optional(),
  ifsc_code: z.string().optional(),
  account_type: z.string().min(1, 'Account type is required'),
  opening_balance: z.number().min(0, 'Opening balance must be non-negative'),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface BankAccountFormProps {
  editData?: any
  onSuccess: () => void
  onCancel: () => void
}

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_name: editData?.account_name || '',
      account_number: editData?.account_number || '',
      bank_name: editData?.bank_name || '',
      branch_name: editData?.branch_name || '',
      ifsc_code: editData?.ifsc_code || '',
      account_type: editData?.account_type || 'savings',
      opening_balance: editData?.opening_balance || 0,
      is_active: editData?.is_active ?? true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const dataToSubmit = {
        account_name: values.account_name,
        account_number: values.account_number,
        bank_name: values.bank_name,
        branch_name: values.branch_name,
        ifsc_code: values.ifsc_code,
        account_type: values.account_type,
        opening_balance: values.opening_balance,
        is_active: values.is_active,
        organization_id: userProfile?.organization_id!,
        current_balance: editData ? editData.current_balance : values.opening_balance,
      }

      if (editData) {
        const { error } = await supabase
          .from('bank_accounts')
          .update(dataToSubmit)
          .eq('id', editData.id)

        if (error) throw error
        toast({ title: 'Success', description: 'Bank account updated successfully' })
      } else {
        const { error } = await supabase
          .from('bank_accounts')
          .insert([dataToSubmit])

        if (error) throw error
        toast({ title: 'Success', description: 'Bank account created successfully' })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bank account',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bank name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branch_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter branch name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ifsc_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter IFSC code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="fd">Fixed Deposit</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="opening_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
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
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editData ? 'Update' : 'Create'} Bank Account
          </Button>
        </div>
      </form>
    </Form>
  )
}