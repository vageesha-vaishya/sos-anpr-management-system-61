import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface HostFormProps {
  onSuccess?: () => void
}

export const HostFormFull: React.FC<HostFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Host Management"
      description="Manage application hosts and server configurations"
      features={[
        "Host configuration management",
        "Server monitoring",
        "Application deployment", 
        "Performance optimization"
      ]}
    />
  )
}