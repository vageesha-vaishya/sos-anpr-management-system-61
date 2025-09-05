import React from 'react'
import { DataTable } from './DataTable'
import { AlertForm } from '@/components/forms/AlertForm'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

const columns = [
  {
    key: 'title',
    header: 'Title',
    render: (value: string) => (
      <div className="max-w-xs truncate font-medium" title={value}>
        {value}
      </div>
    ),
  },
  {
    key: 'alert_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant="outline">
        {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
      </Badge>
    ),
  },
  {
    key: 'severity',
    header: 'Severity',
    render: (value: string) => {
      const getIcon = () => {
        switch (value) {
          case 'critical':
            return <AlertTriangle className="h-3 w-3 mr-1" />
          case 'high':
            return <AlertCircle className="h-3 w-3 mr-1" />
          default:
            return <Info className="h-3 w-3 mr-1" />
        }
      }

      return (
        <Badge variant={
          value === 'critical' ? 'destructive' : 
          value === 'high' ? 'default' : 
          value === 'medium' ? 'secondary' : 
          'outline'
        }>
          {getIcon()}
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'N/A'}
        </Badge>
      )
    },
  },
  {
    key: 'message',
    header: 'Message',
    render: (value: string) => (
      <div className="max-w-sm truncate" title={value}>
        {value}
      </div>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'secondary'}>
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

export const AlertsTable: React.FC = () => {
  return (
    <DataTable
      title="Alerts"
      tableName="alerts"
      columns={columns}
      FormComponent={AlertForm}
      searchFields={['title', 'message']}
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}