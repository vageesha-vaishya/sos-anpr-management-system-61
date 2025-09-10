import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { generateSecurePassword, validatePasswordStrength } from '@/lib/security'
import { Copy, Eye, EyeOff, AlertTriangle, Shield, RefreshCw, Mail, MessageSquare } from 'lucide-react'

const passwordFormSchema = z.object({
  action: z.enum(['reset_link', 'temporary_password', 'permanent_password']),
  method: z.enum(['email', 'sms', 'whatsapp']).optional(),
  password: z.string().optional(),
  reason: z.string().min(1, 'Please provide a reason for this action'),
  notifyUser: z.boolean().default(true)
})

type PasswordFormData = z.infer<typeof passwordFormSchema>

interface AdminPasswordFormProps {
  user: {
    id: string
    email: string
    full_name: string
    phone?: string
    requires_password_change?: boolean
    admin_set_password?: boolean
    last_password_change?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export const AdminPasswordForm: React.FC<AdminPasswordFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<any>(null)

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      action: 'reset_link',
      method: 'email',
      notifyUser: true,
      reason: ''
    }
  })

  const action = form.watch('action')
  const password = form.watch('password')

  // Generate temporary password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16)
    setGeneratedPassword(newPassword)
    form.setValue('password', newPassword)
    const strength = validatePasswordStrength(newPassword)
    setPasswordStrength(strength)
  }

  // Copy password to clipboard
  const handleCopyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard"
      })
    }
  }

  // Validate custom password
  React.useEffect(() => {
    if (password && action === 'permanent_password') {
      const strength = validatePasswordStrength(password)
      setPasswordStrength(strength)
    }
  }, [password, action])

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('admin-password-management', {
        body: {
          userId: user.id,
          action: data.action,
          method: data.method,
          password: data.password,
          reason: data.reason,
          notifyUser: data.notifyUser
        }
      })

      if (error) throw error

      toast({
        title: "Success",
        description: getSuccessMessage(data.action),
        variant: "default"
      })

      onSuccess?.()
    } catch (error: any) {
      console.error('Password management error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to manage password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuccessMessage = (action: string) => {
    switch (action) {
      case 'reset_link':
        return 'Password reset link has been sent'
      case 'temporary_password':
        return 'Temporary password has been set and user will be forced to change it'
      case 'permanent_password':
        return 'Password has been updated successfully'
      default:
        return 'Password action completed'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Password Management
        </CardTitle>
        <CardDescription>
          Manage password for {user.full_name} ({user.email})
        </CardDescription>
        
        {/* User Status Badges */}
        <div className="flex gap-2 mt-2">
          {user.requires_password_change && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires Password Change
            </Badge>
          )}
          {user.admin_set_password && (
            <Badge variant="outline" className="text-blue-600">
              Admin Set Password
            </Badge>
          )}
          {user.last_password_change && (
            <Badge variant="outline" className="text-gray-600">
              Last Changed: {new Date(user.last_password_change).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Action Selection */}
            <Tabs value={action} onValueChange={(value) => form.setValue('action', value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reset_link" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Reset Link
                </TabsTrigger>
                <TabsTrigger value="temporary_password" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Temporary
                </TabsTrigger>
                <TabsTrigger value="permanent_password" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permanent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reset_link" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will send a password reset link via the selected method. User will choose their own new password.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          {user.phone && <SelectItem value="sms">SMS</SelectItem>}
                          {user.phone && <SelectItem value="whatsapp">WhatsApp</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="temporary_password" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will generate a secure temporary password. User will be forced to change it on next login.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Secure Password
                  </Button>

                  {generatedPassword && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={generatedPassword}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyPassword}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {passwordStrength && (
                        <div className="text-sm">
                          <Badge variant={passwordStrength.isValid ? "default" : "destructive"}>
                            {passwordStrength.feedback}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="permanent_password" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Set a specific password for the user. Use this only in emergency situations. User will not be forced to change it.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordStrength && (
                        <div className="text-sm mt-2">
                          <Badge variant={passwordStrength.isValid ? "default" : "destructive"}>
                            {passwordStrength.feedback}
                          </Badge>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Password Change *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a reason for this password action (for audit purposes)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (action === 'temporary_password' && !generatedPassword) || (action === 'permanent_password' && (!password || !passwordStrength?.isValid))}
              >
                {loading ? "Processing..." : getActionButtonText(action)}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

const getActionButtonText = (action: string) => {
  switch (action) {
    case 'reset_link':
      return 'Send Reset Link'
    case 'temporary_password':
      return 'Set Temporary Password'
    case 'permanent_password':
      return 'Set Permanent Password'
    default:
      return 'Submit'
  }
}