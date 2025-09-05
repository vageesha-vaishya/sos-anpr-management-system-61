import React from 'react'
import { DataTable } from './DataTable'
import { BuildingForm } from '@/components/forms/BuildingForm'
import { Badge } from '@/components/ui/badge'
import { Building } from 'lucide-react'

const columns = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'locations',
    header: 'Location',
    render: (value: any) => value?.name || 'N/A',
  },
  {
    key: 'building_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant="secondary">
        <Building className="h-3 w-3 mr-1" />
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'floors',
    header: 'Floors',
    render: (value: number) => `${value} floor${value !== 1 ? 's' : ''}`,
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
    key: 'created_at',
    header: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const BuildingsTable: React.FC = () => {
  return (
    <DataTable
      title="Buildings"
      tableName="buildings"
      columns={columns}
      FormComponent={BuildingForm}
      searchFields={['name', 'description']}
      selectQuery="*, locations!inner(name)"
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}