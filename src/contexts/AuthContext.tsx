import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type UserProfile = {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: 'platform_admin' | 'franchise_admin' | 'franchise_user' | 'customer_admin' | 'customer_user'
  permissions: string[]
  status: 'active' | 'inactive' | 'pending'
  last_login: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // For demo purposes - create a mock user profile to test ADDA features
    const createDemoUser = () => {
      const demoUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'demo@adda.io',
        email_confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User

      const demoProfile: UserProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        organization_id: '00000000-0000-0000-0000-000000000003',
        email: 'demo@adda.io',
        full_name: 'Demo Admin User',
        role: 'customer_admin',
        permissions: ['all'],
        status: 'active',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      setUser(demoUser)
      setUserProfile(demoProfile)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: demoUser
      } as Session)
      setLoading(false)
      
      console.log('Demo user logged in for ADDA testing:', demoProfile)
    }

    // Create demo user immediately for testing
    createDemoUser()

    // Get initial session (commented out for demo)
    /*
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Use setTimeout to avoid deadlock in auth callback
        setTimeout(() => {
          if (mounted) {
            loadUserProfile(session.user.id).finally(() => {
              if (mounted) setLoading(false)
            })
          }
        }, 0)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    */
  }, [])

  const loadUserProfile = async (authUserId: string): Promise<void> => {
    try {
      console.log('Loading profile for user:', authUserId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle()

      if (error) {
        console.error('Error loading user profile:', error)
        // For now, set a default profile to prevent blocking
        setUserProfile({
          id: authUserId,
          organization_id: 'default',
          email: 'unknown@example.com',
          full_name: 'Unknown User',
          role: 'customer_user',
          permissions: [],
          status: 'active',
          last_login: null,
          created_at: new Date().toISOString()
        })
        return
      }

      if (data) {
        console.log('Profile loaded:', data)
        setUserProfile(data as UserProfile)
        
        // Update last login in background
        supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authUserId)
          .then(({ error }) => {
            if (error) console.error('Error updating last login:', error)
          })
      } else {
        console.warn('No profile found for user:', authUserId, '- creating default profile')
        // Create a default profile to prevent blocking
        setUserProfile({
          id: authUserId,
          organization_id: 'default',
          email: 'unknown@example.com',
          full_name: 'Unknown User',
          role: 'customer_user',
          permissions: [],
          status: 'active',
          last_login: null,
          created_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      // Set default profile as fallback
      setUserProfile({
        id: authUserId,
        organization_id: 'default',
        email: 'unknown@example.com', 
        full_name: 'Unknown User',
        role: 'customer_user',
        permissions: [],
        status: 'active',
        last_login: null,
        created_at: new Date().toISOString()
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login with email:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Login error:', error)
      } else {
        console.log('Login successful')
      }
      
      return { error }
    } catch (error) {
      console.error('Login exception:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email
          }
        }
      })
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Clear demo user state
      setUser(null)
      setUserProfile(null)
      setSession(null)
      setLoading(false)
      
      // Also attempt to sign out from Supabase (in case real auth is used later)
      await supabase.auth.signOut()
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setUserProfile({ ...userProfile, ...updates })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}