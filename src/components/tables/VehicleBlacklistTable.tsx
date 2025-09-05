import React from 'react'
import { DataTable } from './DataTable'
import { VehicleBlacklistForm } from '@/components/forms/VehicleBlacklistForm'
import { Badge } from '@/components/ui/badge'
import { Ban, AlertTriangle } from 'lucide-react'

const columns = [
  {
    key: 'license_plate',
    header: 'License Plate',
    render: (value: string) => (
      <div className="flex items-center gap-2">
        <Ban className="h-3 w-3 text-destructive" />
        <code className="font-mono font-semibold text-destructive">{value}</code>
      </div>
    ),
  },
  {
    key: 'vehicle_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant="outline">
        {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
      </Badge>
    ),
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value || 'N/A'}
      </div>
    ),
  },
  {
    key: 'risk_level',
    header: 'Risk Level',
    render: (value: string) => (
      <Badge variant={
        value === 'high' ? 'destructive' : 
        value === 'medium' ? 'default' : 
        'secondary'
      }>
        {value === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
      </Badge>
    ),
  },
  {
    key: 'reported_by',
    header: 'Reported By',
    render: (value: string) => value || 'N/A',
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (value: boolean) => (
      <Badge variant={value ? 'destructive' : 'secondary'}>
        {value ? 'Blocked' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    header: 'Added',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const VehicleBlacklistTable: React.FC = () => {
  return (
    <DataTable
      title="Vehicle Blacklist"
      tableName="vehicle_blacklist"
      columns={columns}
      FormComponent={VehicleBlacklistForm}
      searchFields={['license_plate', 'reason', 'reported_by']}
      selectQuery="*"
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}