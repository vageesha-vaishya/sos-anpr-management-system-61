import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface SessionTimeoutConfig {
  timeoutMinutes?: number
  warningMinutes?: number
  onTimeout?: () => void
  onWarning?: () => void
}

export function useSessionTimeout(config: SessionTimeoutConfig = {}) {
  const {
    timeoutMinutes = 30,
    warningMinutes = 5,
    onTimeout,
    onWarning
  } = config
  
  const { signOut, user, session } = useAuth()
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())
  
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now()
    
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    
    if (!user || !session) return
    
    // Set warning timeout
    warningRef.current = setTimeout(() => {
      const warningMessage = `Your session will expire in ${warningMinutes} minutes due to inactivity.`
      
      toast({
        title: 'Session Warning',
        description: warningMessage,
        variant: 'destructive'
      })
      
      onWarning?.()
    }, (timeoutMinutes - warningMinutes) * 60 * 1000)
    
    // Set session timeout
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: 'Session Expired',
        description: 'Your session has expired due to inactivity. Please sign in again.',
        variant: 'destructive'
      })
      
      onTimeout?.()
      await signOut()
    }, timeoutMinutes * 60 * 1000)
    
  }, [user, session, timeoutMinutes, warningMinutes, onTimeout, onWarning, signOut, toast])
  
  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const resetTimer = () => {
      const now = Date.now()
      // Only reset if it's been more than 1 minute since last activity (avoid excessive resets)
      if (now - lastActivityRef.current > 60000) {
        resetTimeout()
      }
    }
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })
    
    // Initial setup
    resetTimeout()
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [resetTimeout])
  
  // Reset timeout when session changes
  useEffect(() => {
    resetTimeout()
  }, [session, resetTimeout])
  
  return {
    resetTimeout,
    lastActivity: lastActivityRef.current
  }
}