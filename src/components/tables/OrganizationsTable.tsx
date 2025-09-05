import React from 'react'
import { DataTable } from './DataTable'
import { OrganizationForm } from '@/components/forms/OrganizationForm'
import { Badge } from '@/components/ui/badge'

const columns = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'organization_type',
    header: 'Type',
    render: (value: string) => (
      <Badge variant={
        value === 'platform' ? 'default' : 
        value === 'franchise' ? 'secondary' : 
        'outline'
      }>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'subscription_plan',
    header: 'Plan',
    render: (value: string) => (
      <Badge variant={
        value === 'enterprise' ? 'default' : 
        value === 'premium' ? 'secondary' : 
        'outline'
      }>
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
    key: 'created_at',
    header: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const OrganizationsTable: React.FC = () => {
  return (
    <DataTable
      title="Organizations"
      tableName="organizations"
      columns={columns}
      FormComponent={OrganizationForm}
      searchFields={['name']}
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}