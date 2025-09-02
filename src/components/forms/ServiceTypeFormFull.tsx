import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface ServiceTypeFormProps {
  onSuccess?: () => void
}

export const ServiceTypeFormFull: React.FC<ServiceTypeFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Service Type Management"
      description="Manage service types and billing configurations"
      features={[
        "Service categorization",
        "Billing model setup",
        "Rate management", 
        "Service availability tracking"
      ]}
    />
  )
}