import React from 'react'
import { DataTable } from './DataTable'
import { LocationForm } from '@/components/forms/LocationForm'
import { MapPin } from 'lucide-react'

const columns = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'organizations',
    header: 'Organization',
    render: (value: any) => value?.name || 'N/A',
  },
  {
    key: 'cities',
    header: 'City',
    render: (value: any) => value?.name || 'N/A',
  },
  {
    key: 'address',
    header: 'Address',
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
    ),
  },
  {
    key: 'coordinates',
    header: 'Coordinates',
    render: (value: any, row: any) => {
      if (row.latitude && row.longitude) {
        return (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{row.latitude}, {row.longitude}</span>
          </div>
        )
      }
      return 'N/A'
    },
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
]

export const LocationsTable: React.FC = () => {
  return (
    <DataTable
      title="Locations"
      tableName="locations"
      columns={columns}
      FormComponent={LocationForm}
      searchFields={['name', 'address']}
      selectQuery="*, organizations(name), cities(name)"
      orderBy={{ column: 'created_at', ascending: false }}
    />
  )
}