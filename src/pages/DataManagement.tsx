import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrganizationsTable } from '@/components/tables/OrganizationsTable'
import { LocationsTable } from '@/components/tables/LocationsTable'
import { BuildingsTable } from '@/components/tables/BuildingsTable'
import { EntryGatesTable } from '@/components/tables/EntryGatesTable'
import { CamerasTable } from '@/components/tables/CamerasTable'
import { VehicleWhitelistTable } from '@/components/tables/VehicleWhitelistTable'
import { VehicleBlacklistTable } from '@/components/tables/VehicleBlacklistTable'
import { AlertsTable } from '@/components/tables/AlertsTable'
import { Building, Camera, MapPin, Users, Car, DoorOpen, Database, AlertTriangle, Ban } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const DataManagement: React.FC = () => {
  const { userProfile } = useAuth()
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Configure and manage all system data entries
          </p>
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="organizations" className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            Orgs
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="buildings" className="flex items-center gap-1 text-xs">
            <Building className="w-3 h-3" />
            Buildings
          </TabsTrigger>
          <TabsTrigger value="gates" className="flex items-center gap-1 text-xs">
            <DoorOpen className="w-3 h-3" />
            Gates
          </TabsTrigger>
          <TabsTrigger value="cameras" className="flex items-center gap-1 text-xs">
            <Camera className="w-3 h-3" />
            Cameras
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="flex items-center gap-1 text-xs">
            <Car className="w-3 h-3" />
            Whitelist
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="flex items-center gap-1 text-xs">
            <Ban className="w-3 h-3" />
            Blacklist
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <OrganizationsTable />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <LocationsTable />
        </TabsContent>

        <TabsContent value="buildings" className="space-y-6">
          <BuildingsTable organizationId={userProfile?.organization_id} />
        </TabsContent>

        <TabsContent value="gates" className="space-y-6">
          <EntryGatesTable />
        </TabsContent>
        <TabsContent value="cameras" className="space-y-6">
          <CamerasTable />
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-6">
          <VehicleWhitelistTable />
        </TabsContent>

        <TabsContent value="blacklist" className="space-y-6">
          <VehicleBlacklistTable />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}