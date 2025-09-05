import React from 'react'
import { DataTable } from './DataTable'
import { CameraForm } from '@/components/forms/CameraForm'
import { Badge } from '@/components/ui/badge'
import { Camera } from 'lucide-react'

const columns = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'entry_gates',
    header: 'Entry Gate',
    render: (value: any) => value?.name || 'N/A',
  },
  {
    key: 'ip_address',
    header: 'IP Address',
    render: (value: string) => (
      <code className="text-xs bg-muted px-1 py-0.5 rounded">
        {value}
      </code>
    ),
  },
  {
    key: 'rtsp_url',
    header: 'RTSP URL',
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value ? (
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {value}
          </code>
        ) : 'N/A'}
      </div>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'destructive'}>
        <Camera className="h-3 w-3 mr-1" />
        {value ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const CamerasTable: React.FC = () => {
  return (
    <DataTable
      title="Cameras"
      tableName="cameras"
      columns={columns}
      FormComponent={CameraForm}
      searchFields={['name', 'ip_address']}
      selectQuery="*, entry_gates!inner(name)"
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}