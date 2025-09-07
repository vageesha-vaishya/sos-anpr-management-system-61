import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Plus, 
  Droplets, 
  Flame, 
  Wifi,
  Calculator,
  TrendingUp
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const UtilityTracker = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("utility-bills")

  const utilityTypes = [
    {
      name: "Electricity",
      icon: Zap,
      currentBill: "₹23,500",
      consumption: "4,200 kWh",
      status: "paid",
      color: "text-yellow-600"
    },
    {
      name: "Water",
      icon: Droplets,
      currentBill: "₹7,500",
      consumption: "850 kL",
      status: "paid",
      color: "text-blue-600"
    },
    {
      name: "Gas",
      icon: Flame,
      currentBill: "₹3,200",
      consumption: "125 SCM",
      status: "pending",
      color: "text-orange-600"
    },
    {
      name: "Internet",
      icon: Wifi,
      currentBill: "₹5,000",
      consumption: "Unlimited",
      status: "paid",
      color: "text-purple-600"
    }
  ]

  const monthlyStats = [
    {
      title: "Total Utility Cost",
      value: "₹39,200",
      change: "+8.2%",
      icon: Calculator
    },
    {
      title: "Average per Unit",
      value: "₹1,307",
      change: "+5.1%",
      icon: TrendingUp
    },
    {
      title: "Electricity Consumption",
      value: "4,200 kWh",
      change: "+12.3%",
      icon: Zap
    },
    {
      title: "Water Consumption",
      value: "850 kL",
      change: "-2.1%",
      icon: Droplets
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Utility Tracker</h1>
            <p className="text-muted-foreground">
              Consumption tracking, billing management, and unit-wise allocation
            </p>
          </div>
          <Button onClick={() => navigate("/society-books-management")}>
            Back to Books Management
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {monthlyStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {utilityTypes.map((utility, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <utility.icon className={`h-6 w-6 ${utility.color}`} />
                </div>
                <Badge 
                  variant={utility.status === 'paid' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {utility.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{utility.name}</CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <div>Amount: {utility.currentBill}</div>
                  <div>Usage: {utility.consumption}</div>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="utility-bills">Utility Bills</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="allocation">Unit Allocation</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="utility-bills" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utility Bills</CardTitle>
                  <CardDescription>Track all utility bills and payments</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Bill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Utility Bills</h3>
                <p className="text-muted-foreground mb-4">
                  Utility bill data will appear here once the database types are updated
                </p>
                <Button variant="outline">Setup Utility Tracking</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consumption Analysis</CardTitle>
                <CardDescription>Monthly consumption trends and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Consumption Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze consumption patterns and identify optimization opportunities
                  </p>
                  <Button>View Consumption Analytics</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meter Readings</CardTitle>
                <CardDescription>Record and track meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Meter Reading System</h3>
                  <p className="text-muted-foreground mb-4">
                    Record monthly meter readings for accurate billing
                  </p>
                  <Button variant="outline">Record Readings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Unit-wise Allocation</CardTitle>
                  <CardDescription>Distribute utility costs among units</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculate Allocation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Unit Allocation</h3>
                <p className="text-muted-foreground mb-4">
                  Unit allocation data will appear here once the database types are updated
                </p>
                <Button variant="outline">Setup Unit Allocation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Billing</CardTitle>
                <CardDescription>Set up automatic bill generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button>Configure Auto-Billing</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Rules</CardTitle>
                <CardDescription>Define allocation methods and rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button variant="outline">Setup Billing Rules</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>Identify savings opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button variant="outline">View Optimization Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumption Alerts</CardTitle>
                <CardDescription>Set up usage threshold alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button variant="outline">Configure Alerts</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UtilityTracker