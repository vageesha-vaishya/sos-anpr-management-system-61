import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, AlertTriangle, Shield, Camera, MapPin, Clock } from "lucide-react"

const Alerts = () => {
  const activeAlerts = [
    {
      id: 1,
      type: "vehicle_detected",
      title: "Blacklisted Vehicle Detected",
      description: "Vehicle BAD-999 detected at Main Entrance",
      location: "Downtown Office - Main Entrance",
      camera: "CAM-001",
      severity: "high",  
      timestamp: "2 min ago"
    },
    {
      id: 2,
      type: "camera_offline",
      title: "Camera Offline",
      description: "Loading Bay camera has gone offline",
      location: "Warehouse North - Loading Bay",
      camera: "CAM-003", 
      severity: "medium",
      timestamp: "15 min ago"
    }
  ]

  const resolvedAlerts = [
    {
      id: 3,
      type: "unauthorized_access",
      title: "Unauthorized Access Attempt",
      description: "Unknown vehicle attempted entry at Gate 2",
      location: "Customer Site A - Gate 2",
      camera: "CAM-005",
      severity: "high",
      timestamp: "1 hour ago",
      resolvedBy: "Security Team"
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'vehicle_detected': return Shield
      case 'camera_offline': return Camera
      case 'unauthorized_access': return AlertTriangle
      default: return Bell
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert Management</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts and notifications</p>
        </div>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Alerts ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved Alerts ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type)
              return (
                <Card key={alert.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {alert.title}
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{alert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="w-4 h-4" />
                        <span>Camera: {alert.camera}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{alert.timestamp}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="default" size="sm">Resolve</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Acknowledge</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          <div className="space-y-4">
            {resolvedAlerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type)
              return (
                <Card key={alert.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {alert.title}
                      </div>
                      <Badge variant="outline">RESOLVED</Badge>
                    </CardTitle>
                    <CardDescription>{alert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="w-4 h-4" />
                        <span>Camera: {alert.camera}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{alert.timestamp}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Resolved by: {alert.resolvedBy}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Alerts