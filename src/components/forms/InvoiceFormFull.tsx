import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface InvoiceFormProps {
  onSuccess?: () => void
}

export const InvoiceFormFull: React.FC<InvoiceFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Invoice Management"
      description="Create and manage invoices for billing and payments"
      features={[
        "Invoice generation",
        "Payment tracking",
        "Billing automation", 
        "Financial reporting"
      ]}
    />
  )
}