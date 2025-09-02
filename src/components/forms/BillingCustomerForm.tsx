import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface BillingCustomerFormProps {
  onSuccess?: () => void
}

export const BillingCustomerForm: React.FC<BillingCustomerFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Billing Customer Management"
      description="Manage customer billing information and payment processing"
      features={[
        "Customer payment profiles",
        "Billing automation",
        "Invoice generation", 
        "Payment tracking and reporting"
      ]}
    />
  )
}