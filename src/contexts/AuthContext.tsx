import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type UserProfile = {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: 'platform_admin' | 'franchise_admin' | 'customer_admin' | 'operator' | 'resident'
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended'
  last_login: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signingOut: boolean
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
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile when logged in
          try {
            console.log('AuthContext: Fetching profile for user:', session.user.id)
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()
            
            console.log('AuthContext: Profile fetch result:', { profile, error })
            
            if (error) {
              console.error('Error fetching user profile:', error)
            } else if (profile && mounted) {
              console.log('AuthContext: Setting user profile:', profile)
              setUserProfile(profile)
            } else {
              console.log('AuthContext: No profile found for user')
            }
          } catch (error) {
            console.error('Exception fetching user profile:', error)
          }
        } else {
          setUserProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    // THEN check for existing session with timeout
    const sessionTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Session check timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      clearTimeout(sessionTimeout)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          console.log('AuthContext: Getting session profile for user:', session.user.id)
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          
          console.log('AuthContext: Session profile fetch result:', { profile, error })
          
          if (error) {
            console.error('Error fetching session profile:', error)
          } else if (profile && mounted) {
            console.log('AuthContext: Setting session profile:', profile)
            setUserProfile(profile)
          } else {
            console.log('AuthContext: No session profile found')
          }
        } catch (error) {
          console.error('Exception fetching session profile:', error)
        }
      }
      
      if (mounted) {
        setLoading(false)
      }
    }).catch(error => {
      console.error('Error getting session:', error)
      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(sessionTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
    if (signingOut) return // Prevent multiple simultaneous logout attempts
    
    setSigningOut(true)
    
    try {
      console.log('AuthContext: Starting sign out process')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      console.log('AuthContext: Successfully signed out from Supabase')
      
      // Manually clear all state to ensure clean logout
      setUser(null)
      setUserProfile(null)
      setSession(null)
      
      // Redirect to auth page
      window.location.href = '/auth'
      
    } catch (error) {
      console.error('Sign out failed:', error)
      // Even if there's an error, try to clear state and redirect
      setUser(null)
      setUserProfile(null)
      setSession(null)
      window.location.href = '/auth'
    } finally {
      setSigningOut(false)
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
    signingOut,
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