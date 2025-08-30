import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { setupDatabase, checkDatabaseHealth } from '@/lib/setup-database'
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const DatabaseSetup = () => {
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null)
  const { toast } = useToast()

  const handleSetupDatabase = async () => {
    setIsSetupRunning(true)
    
    try {
      const result = await setupDatabase()
      
      if (result.success) {
        setSetupComplete(true)
        toast({
          title: "Database Setup Complete",
          description: result.message,
        })
      } else {
        toast({
          title: "Setup Failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "An unexpected error occurred during setup",
        variant: "destructive"
      })
    } finally {
      setIsSetupRunning(false)
    }
  }

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true)
    
    try {
      const isHealthy = await checkDatabaseHealth()
      setHealthStatus(isHealthy)
      
      toast({
        title: isHealthy ? "Database Healthy" : "Database Issues",
        description: isHealthy 
          ? "All database tables are accessible" 
          : "Some database tables may be missing",
        variant: isHealthy ? "default" : "destructive"
      })
    } catch (error) {
      setHealthStatus(false)
      toast({
        title: "Health Check Failed",
        description: "Could not check database health",
        variant: "destructive"
      })
    } finally {
      setIsCheckingHealth(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold">ANPR Database Setup</h1>
        <p className="text-muted-foreground mt-2">
          Initialize your ANPR system database with demo data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Database Configuration</span>
          </CardTitle>
          <CardDescription>
            Set up the complete ANPR database schema with demo data including organizations, locations, cameras, and sample detections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Database Tables</h4>
                <p className="text-sm text-muted-foreground">
                  Create all required tables with proper relationships
                </p>
              </div>
              <Badge variant="outline">13 Tables</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Demo Data</h4>
                <p className="text-sm text-muted-foreground">
                  Sample organizations, locations, cameras, and vehicles
                </p>
              </div>
              <Badge variant="outline">Sample Data</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Admin User</h4>
                <p className="text-sm text-muted-foreground">
                  Platform admin profile for Bahuguna.vimal@gmail.com
                </p>
              </div>
              <Badge variant="outline">Admin Setup</Badge>
            </div>
          </div>

          {setupComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Database setup completed successfully! You can now use all ANPR system features.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleSetupDatabase}
              disabled={isSetupRunning}
              className="flex-1"
            >
              {isSetupRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Setup Database
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCheckHealth}
              disabled={isCheckingHealth}
            >
              {isCheckingHealth ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  {healthStatus === true ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  ) : healthStatus === false ? (
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Health Check
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What gets created?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Location Hierarchy:</strong> Continents → Countries → States → Cities → Locations → Buildings → Gates → Cameras</p>
            <p><strong>Organizations:</strong> Platform, Franchise, and Customer organizations with proper relationships</p>
            <p><strong>ANPR System:</strong> Camera configurations, detection logs, vehicle whitelist/blacklist</p>
            <p><strong>Security:</strong> Alerts system, user roles, and permissions</p>
            <p><strong>Demo Data:</strong> Sample vehicles, detections, and alerts for testing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}