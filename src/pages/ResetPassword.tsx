import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Lock, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      verifyToken(tokenFromUrl)
    }
  }, [searchParams])

  const verifyToken = async (resetToken: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, password_reset_expires')
        .eq('password_reset_token', resetToken)
        .single()

      if (error || !data) {
        toast({
          title: 'Invalid Token',
          description: 'The reset token is invalid or has expired',
          variant: 'destructive',
        })
        return
      }

      if (new Date(data.password_reset_expires) < new Date()) {
        toast({
          title: 'Token Expired',
          description: 'The reset token has expired. Please request a new one.',
          variant: 'destructive',
        })
        return
      }

      setValidToken(true)
    } catch (error) {
      console.error('Error verifying token:', error)
      toast({
        title: 'Error',
        description: 'Failed to verify reset token',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast({
        title: 'Error',
        description: 'Reset token is required',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Get user by reset token
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('password_reset_token', token)
        .single()

      if (profileError || !profile) {
        throw new Error('Invalid reset token')
      }

      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        profile.id,
        { password: newPassword }
      )

      if (authError) {
        // If admin update fails, try regular update (user needs to be signed in)
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (updateError) throw updateError
      }

      // Clear reset token
      await supabase
        .from('profiles')
        .update({
          password_reset_token: null,
          password_reset_expires: null,
        })
        .eq('id', profile.id)

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      })

      navigate('/auth', { 
        state: { message: 'Password updated successfully. Please sign in with your new password.' }
      })
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token) {
      verifyToken(token)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your reset token to proceed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <Label htmlFor="token">Reset Token</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter reset token or code"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify Token
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword