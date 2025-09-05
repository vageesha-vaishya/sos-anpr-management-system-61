import React from 'react'
import { DataTable } from './DataTable'
import { VehicleWhitelistForm } from '@/components/forms/VehicleWhitelistForm'
import { Badge } from '@/components/ui/badge'
import { Car, Calendar } from 'lucide-react'

const columns = [
  {
    key: 'license_plate',
    header: 'License Plate',
    render: (value: string) => (
      <div className="flex items-center gap-2">
        <Car className="h-3 w-3" />
        <code className="font-mono font-semibold">{value}</code>
      </div>
    ),
  },
  {
    key: 'vehicle_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant="secondary">
        {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
      </Badge>
    ),
  },
  {
    key: 'owner_name',
    header: 'Owner',
  },
  {
    key: 'owner_contact',
    header: 'Contact',
    render: (value: string) => (
      <code className="text-xs bg-muted px-1 py-0.5 rounded">
        {value || 'N/A'}
      </code>
    ),
  },
  {
    key: 'expiry_date',
    header: 'Expires',
    render: (value: string) => {
      if (!value) return 'Never'
      const expiryDate = new Date(value)
      const isExpired = expiryDate < new Date()
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className={isExpired ? 'text-destructive' : ''}>
            {expiryDate.toLocaleDateString()}
          </span>
        </div>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) => (
      <Badge variant={
        value === 'active' ? 'default' : 
        value === 'expired' ? 'destructive' : 
        'secondary'
      }>
        {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
      </Badge>
    ),
  },
]

export const VehicleWhitelistTable: React.FC = () => {
  return (
    <DataTable
      title="Vehicle Whitelist"
      tableName="vehicle_whitelist"
      columns={columns}
      FormComponent={VehicleWhitelistForm}
      searchFields={['license_plate', 'owner_name', 'owner_contact']}
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}