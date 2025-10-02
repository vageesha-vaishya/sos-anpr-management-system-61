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

interface BuildingsTableProps {
  organizationId?: string
  showAllOrganizations?: boolean
}

export const BuildingsTable: React.FC<BuildingsTableProps> = ({ organizationId, showAllOrganizations = false }) => {
  return (
    <DataTable
      title="Buildings"
      tableName="buildings"
      columns={columns}
      FormComponent={BuildingForm}
      formProps={{ organizationId, showAllOrganizations }}
      searchFields={['name', 'description']}
      selectQuery="*, locations!inner(name, organization_id, organizations(name))"
      orderBy={{ column: 'created_at', ascending: false }}
      additionalFilters={!showAllOrganizations && organizationId ? [{ column: 'locations.organization_id', value: organizationId }] : []}
    />
  )
}