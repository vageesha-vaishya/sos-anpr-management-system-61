import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationForm } from '@/components/forms/OrganizationForm'
import { LocationForm } from '@/components/forms/LocationForm'
import { BuildingForm } from '@/components/forms/BuildingForm'
import { EntryGateForm } from '@/components/forms/EntryGateForm'
import { CameraForm } from '@/components/forms/CameraForm'
import { VehicleWhitelistForm } from '@/components/forms/VehicleWhitelistForm'
import { VehicleBlacklistForm } from '@/components/forms/VehicleBlacklistForm'
import { AlertForm } from '@/components/forms/AlertForm'
import { Building, Camera, Shield, MapPin, Users, Car, DoorOpen, Database, AlertTriangle, Ban } from 'lucide-react'

export const DataManagement: React.FC = () => {
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
          <div className="grid gap-6 md:grid-cols-2">
            <OrganizationForm onSuccess={() => console.log('Organization created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>
                  Organizations represent different levels in the system hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Organization Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Platform:</strong> System-wide management</li>
                    <li>• <strong>Franchise:</strong> Multi-location oversight</li>
                    <li>• <strong>Customer:</strong> Individual business entities</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Subscription Plans:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Basic:</strong> Essential features</li>
                    <li>• <strong>Premium:</strong> Advanced analytics</li>
                    <li>• <strong>Enterprise:</strong> Full feature set</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <LocationForm onSuccess={() => console.log('Location created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Location Management</CardTitle>
                <CardDescription>
                  Locations represent physical sites where ANPR systems are deployed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Location Information:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Must be associated with an organization</li>
                    <li>• Requires a valid city from the system database</li>
                    <li>• Can include GPS coordinates for mapping</li>
                    <li>• Address should be complete and accurate</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Use Cases:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Office buildings</li>
                    <li>• Parking facilities</li>
                    <li>• Residential complexes</li>
                    <li>• Industrial sites</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="buildings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BuildingForm onSuccess={() => console.log('Building created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Building Management</CardTitle>
                <CardDescription>
                  Buildings are structures within locations where entry gates are installed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Building Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Office:</strong> Commercial office buildings</li>
                    <li>• <strong>Residential:</strong> Apartment complexes, condos</li>
                    <li>• <strong>Commercial:</strong> Shopping centers, retail</li>
                    <li>• <strong>Industrial:</strong> Warehouses, factories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <EntryGateForm onSuccess={() => console.log('Entry gate created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Entry Gate Management</CardTitle>
                <CardDescription>
                  Entry gates are access points where cameras monitor vehicle traffic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Gate Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Main:</strong> Primary building entrance</li>
                    <li>• <strong>Visitor:</strong> Dedicated visitor access</li>
                    <li>• <strong>Service:</strong> Delivery and service vehicles</li>
                    <li>• <strong>Emergency:</strong> Emergency exit points</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="cameras" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CameraForm onSuccess={() => console.log('Camera created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Camera Management</CardTitle>
                <CardDescription>
                  Register and configure ANPR cameras for license plate detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Camera Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Must be assigned to an entry gate</li>
                    <li>• Requires valid IP address and RTSP URL</li>
                    <li>• Should support minimum 720p resolution</li>
                    <li>• Network connectivity for real-time streaming</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Supported Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time license plate recognition</li>
                    <li>• Vehicle type classification</li>
                    <li>• Motion detection and alerts</li>
                    <li>• Night vision capabilities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <VehicleWhitelistForm onSuccess={() => console.log('Vehicle whitelisted!')} />
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Whitelist Management</CardTitle>
                <CardDescription>
                  Manage authorized vehicles for automatic access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Whitelist Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic gate access for authorized vehicles</li>
                    <li>• Owner contact information storage</li>
                    <li>• Expiry date management</li>
                    <li>• Status tracking (active/inactive/expired)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Vehicle Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cars and personal vehicles</li>
                    <li>• Commercial trucks and vans</li>
                    <li>• Motorcycles and scooters</li>
                    <li>• Public transportation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blacklist" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <VehicleBlacklistForm onSuccess={() => console.log('Vehicle blacklisted!')} />
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Blacklist Management</CardTitle>
                <CardDescription>
                  Block unauthorized or problematic vehicles from access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Security Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic access denial for blocked vehicles</li>
                    <li>• Incident reporting and documentation</li>
                    <li>• Security alert notifications</li>
                    <li>• Risk level classification</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Common Reasons:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Theft or criminal activity</li>
                    <li>• Property damage or vandalism</li>
                    <li>• Unauthorized access attempts</li>
                    <li>• Court orders or legal restrictions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AlertForm onSuccess={() => console.log('Alert created!')} />
            <Card>
              <CardHeader>
                <CardTitle>Alert Management System</CardTitle>
                <CardDescription>
                  Create and manage system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Alert Types:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• System alerts for technical issues</li>
                    <li>• Security alerts for threats or breaches</li>
                    <li>• Maintenance notifications</li>
                    <li>• Detection alerts for unusual activity</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Severity Levels:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <span className="text-muted-foreground">Low:</span> Minor issues or information</li>
                    <li>• <span className="text-warning">Medium:</span> Issues requiring attention</li>
                    <li>• <span className="text-destructive">High:</span> Urgent security concerns</li>
                    <li>• <span className="text-destructive font-bold">Critical:</span> Immediate action required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}