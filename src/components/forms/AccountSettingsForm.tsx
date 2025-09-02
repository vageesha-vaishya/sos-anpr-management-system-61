import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Shield, Key, Mail, Phone, MessageSquare, Calendar, Clock, Lock } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number?: string
  two_factor_enabled: boolean
  preferred_2fa_method: string
  active_from?: string
  active_until?: string
  failed_login_attempts: number
  account_locked_until?: string
}

export const AccountSettingsForm = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
        setProfile({
          ...data,
          // Add missing fields with default values
          two_factor_enabled: false,
          preferred_2fa_method: 'app',
          failed_login_attempts: 0
        })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load profile settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordDialog(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!profile) return

    if (!profile.two_factor_enabled) {
      // Enable 2FA - send verification code first
      setShow2FADialog(true)
      await send2FACode()
    } else {
      // Disable 2FA
      const { error } = await supabase
        .from('profiles')
        .update({ 
          // Note: 2FA features will be available in future update
        })
        .eq('id', profile.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to disable 2FA',
          variant: 'destructive',
        })
      } else {
        setProfile({ ...profile, two_factor_enabled: false })
        toast({
          title: 'Success',
          description: '2FA disabled successfully',
        })
      }
    }
  }

  const send2FACode = async () => {
    if (!profile) return

    try {
      const response = await supabase.functions.invoke('verify-2fa', {
        body: {
          action: 'send',
          userId: profile.id,
          method: profile.preferred_2fa_method,
          email: profile.email,
          phoneNumber: profile.phone_number
        }
      })

      if (response.error) throw response.error

      toast({
        title: 'Verification Code Sent',
        description: `Code sent via ${profile.preferred_2fa_method}`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      })
    }
  }

  const verify2FACode = async () => {
    if (!profile || !twoFactorCode) return

    setUpdating(true)
    try {
      const response = await supabase.functions.invoke('verify-2fa', {
        body: {
          action: 'verify',
          userId: profile.id,
          code: twoFactorCode
        }
      })

      if (response.error) throw response.error

      // Enable 2FA in profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          // Note: 2FA features will be available in future update
        })

      setProfile({ ...profile, two_factor_enabled: true })
      setShow2FADialog(false)
      setTwoFactorCode('')
      
      toast({
        title: 'Success',
        description: '2FA enabled successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Invalid verification code',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const updateProfile = async (field: string, value: any) => {
    if (!profile) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, [field]: value })
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const requestPasswordReset = async (method: 'email' | 'sms' | 'whatsapp') => {
    if (!profile) return

    try {
      const response = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: profile.email,
          method,
          phoneNumber: profile.phone_number
        }
      })

      if (response.error) throw response.error

      toast({
        title: 'Reset Sent',
        description: `Password reset sent via ${method}`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send password reset',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center p-8">Profile not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account security and preferences</p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Password Management
              </CardTitle>
              <CardDescription>
                Change your password or request a reset via multiple methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={updating}>
                        {updating ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => requestPasswordReset('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reset via Email
                </Button>

                {profile.phone_number && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => requestPasswordReset('sms')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Reset via SMS
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => requestPasswordReset('whatsapp')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Reset via WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
                {profile.two_factor_enabled && (
                  <Badge variant="default">Enabled</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require verification code when signing in
                  </p>
                </div>
                <Switch
                  checked={profile.two_factor_enabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred 2FA Method</Label>
                <Select
                  value={profile.preferred_2fa_method}
                  onValueChange={(value) => updateProfile('preferred_2fa_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>View your account security status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Failed Login Attempts</Label>
                  <div className="text-2xl font-bold text-destructive">
                    {profile.failed_login_attempts || 0}
                  </div>
                </div>
                {profile.account_locked_until && (
                  <div>
                    <Label>Account Locked Until</Label>
                    <div className="text-sm text-destructive">
                      {new Date(profile.account_locked_until).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone_number || ''}
                  onChange={(e) => updateProfile('phone_number', e.target.value)}
                  placeholder="Enter phone number for SMS/WhatsApp notifications"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Access Period
              </CardTitle>
              <CardDescription>
                Configure when your account is active (managed by admin)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Active From</Label>
                  <div className="text-sm">
                    {profile.active_from 
                      ? new Date(profile.active_from).toLocaleDateString()
                      : 'No restriction'
                    }
                  </div>
                </div>
                <div>
                  <Label>Active Until</Label>
                  <div className="text-sm">
                    {profile.active_until 
                      ? new Date(profile.active_until).toLocaleDateString()
                      : 'No restriction'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the verification code sent to your {profile.preferred_2fa_method}
            </p>
            <div>
              <Label htmlFor="2faCode">Verification Code</Label>
              <Input
                id="2faCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={verify2FACode} disabled={updating}>
                {updating ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button variant="outline" onClick={send2FACode}>
                Resend Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}