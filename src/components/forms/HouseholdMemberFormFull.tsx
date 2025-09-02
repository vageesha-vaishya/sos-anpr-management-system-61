import React from 'react'
import { ComingSoonForm } from './ComingSoonForm'

interface HouseholdMemberFormProps {
  onSuccess?: () => void
}

export const HouseholdMemberFormFull: React.FC<HouseholdMemberFormProps> = ({ onSuccess }) => {
  return (
    <ComingSoonForm
      title="Household Member Management"
      description="Manage household members and family information"
      features={[
        "Member registration",
        "Family relationship tracking",
        "Contact information management", 
        "Member status updates"
      ]}
    />
  )
}