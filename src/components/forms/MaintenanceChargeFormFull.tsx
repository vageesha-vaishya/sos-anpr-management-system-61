import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface MaintenanceChargeFormProps {
  onSuccess?: () => void
}

export const MaintenanceChargeFormFull: React.FC<MaintenanceChargeFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Maintenance Charge Management"
      description="Manage maintenance charges and billing for residents"
      features={[
        "Maintenance fee calculation",
        "Billing cycle management",
        "Payment tracking", 
        "Charge category organization"
      ]}
    />
  )
}