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
  profileError: string | null
  forceRefresh: () => Promise<void>
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
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetryCount, setProfileRetryCount] = useState(0)
  const [sessionValidated, setSessionValidated] = useState(false)

  // Enhanced profile fetching with retry logic
  const fetchProfileWithRetry = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 3
    const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
    
    try {
      console.log(`AuthContext: Fetching profile (attempt ${retryCount + 1}/${maxRetries + 1}) for user:`, userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      console.log(`AuthContext: Profile fetch attempt ${retryCount + 1} result:`, { profile, error })
      
      if (error) {
        if (retryCount < maxRetries && (error.code === 'PGRST116' || error.message?.includes('JWT') || error.message?.includes('auth'))) {
          console.log(`AuthContext: Retrying profile fetch in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchProfileWithRetry(userId, retryCount + 1)
        }
        throw error
      }
      
      if (profile) {
        setProfileError(null)
        setProfileRetryCount(0)
        return profile
      }
      
      return null
    } catch (error) {
      console.error(`AuthContext: Profile fetch attempt ${retryCount + 1} failed:`, error)
      
      if (retryCount < maxRetries) {
        console.log(`AuthContext: Retrying profile fetch in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchProfileWithRetry(userId, retryCount + 1)
      }
      
      setProfileError(error instanceof Error ? error.message : 'Failed to load user profile')
      setProfileRetryCount(retryCount + 1)
      throw error
    }
  }

  // Session health check
  const validateSession = async (session: Session): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getUser(session.access_token)
      if (error) {
        console.error('AuthContext: Session validation failed:', error)
        return false
      }
      console.log('AuthContext: Session validated successfully')
      return !!data.user
    } catch (error) {
      console.error('AuthContext: Session validation exception:', error)
      return false
    }
  }

  // Force refresh function
  const forceRefresh = async () => {
    try {
      console.log('AuthContext: Force refreshing authentication state...')
      setLoading(true)
      setProfileError(null)
      setProfileRetryCount(0)
      
      // Clear current state
      setUser(null)
      setUserProfile(null)
      setSession(null)
      setSessionValidated(false)
      
      // Force refresh session
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('AuthContext: Force refresh failed:', error)
        throw error
      }
      
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        
        const profile = await fetchProfileWithRetry(session.user.id)
        
        if (profile) {
          setUserProfile(profile)
        }
        
        setSessionValidated(true)
      }
    } catch (error) {
      console.error('AuthContext: Force refresh exception:', error)
      setProfileError('Failed to refresh authentication. Please try logging in again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        
        console.log('AuthContext: Auth state changed:', event, !!session)
        
        // Only synchronous state updates here to prevent deadlocks
        setSession(session)
        setUser(session?.user ?? null)
        setSessionValidated(false)
        
        if (session?.user) {
          // Defer profile fetching to prevent auth callback deadlocks
          setTimeout(async () => {
            if (!mounted) return
            
            try {
              const isValid = await validateSession(session)
              if (!mounted) return
              
              if (isValid) {
                setSessionValidated(true)
                const profile = await fetchProfileWithRetry(session.user.id)
                
                if (mounted && profile) {
                  setUserProfile(profile)
                }
              } else {
                console.warn('AuthContext: Session validation failed, forcing refresh...')
                await forceRefresh()
              }
            } catch (error) {
              console.error('AuthContext: Profile fetch in state change failed:', error)
              if (mounted) {
                setProfileError('Authentication issue detected. Please refresh.')
              }
            } finally {
              if (mounted) {
                setLoading(false)
              }
            }
          }, 0)
        } else {
          setUserProfile(null)
          setProfileError(null)
          setSessionValidated(false)
          setLoading(false)
        }
      }
    )

    // THEN check for existing session with timeout
    const sessionTimeout = setTimeout(() => {
      if (mounted) {
        console.log('AuthContext: Session check timeout, setting loading to false')
        setLoading(false)
      }
    }, 8000) // 8 second timeout

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return
      clearTimeout(sessionTimeout)
      
      if (error) {
        console.error('AuthContext: Error getting initial session:', error)
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          const isValid = await validateSession(session)
          if (!mounted) return
          
          if (isValid) {
            setSessionValidated(true)
            const profile = await fetchProfileWithRetry(session.user.id)
            
            if (mounted && profile) {
              setUserProfile(profile)
            }
          } else {
            console.warn('AuthContext: Initial session validation failed')
            setProfileError('Session validation failed. Please refresh or login again.')
          }
        } catch (error) {
          console.error('AuthContext: Initial profile fetch failed:', error)
          if (mounted) {
            setProfileError('Failed to load user profile. Please refresh or login again.')
          }
        }
      }
      
      if (mounted) {
        setLoading(false)
      }
    }).catch(error => {
      console.error('AuthContext: Exception getting initial session:', error)
      if (mounted) {
        setLoading(false)
        setProfileError('Failed to initialize authentication. Please refresh.')
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
    profileError,
    forceRefresh,
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