import React from 'react'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useAuth } from '@/contexts/AuthContext'

interface SessionManagerProps {
  children: React.ReactNode
  timeoutMinutes?: number
  warningMinutes?: number
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5
}) => {
  const { user } = useAuth()
  
  useSessionTimeout({
    timeoutMinutes,
    warningMinutes,
    onTimeout: () => {
      console.log('Session timed out - user will be redirected to login')
    },
    onWarning: () => {
      console.log('Session warning - user notified of pending timeout')
    }
  })
  
  // Only apply session management for authenticated users
  if (!user) {
    return <>{children}</>
  }
  
  return <>{children}</>
}