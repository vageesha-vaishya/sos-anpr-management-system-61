import React from 'react'
import { DataTable } from './DataTable'
import { EntryGateForm } from '@/components/forms/EntryGateForm'
import { Badge } from '@/components/ui/badge'
import { DoorOpen } from 'lucide-react'

const columns = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'buildings',
    header: 'Building',
    render: (value: any) => value?.name || 'N/A',
  },
  {
    key: 'gate_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant={
        value === 'main' ? 'default' : 
        value === 'visitor' ? 'secondary' : 
        value === 'service' ? 'outline' : 
        'destructive'
      }>
        <DoorOpen className="h-3 w-3 mr-1" />
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (value: boolean) => (
      <Badge variant={value ? 'default' : 'destructive'}>
        {value ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value || 'N/A'}
      </div>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const EntryGatesTable: React.FC = () => {
  return (
    <DataTable
      title="Entry Gates"
      tableName="entry_gates"
      columns={columns}
      FormComponent={EntryGateForm}
      searchFields={['name', 'description']}
      selectQuery="*, buildings!inner(name)"
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}