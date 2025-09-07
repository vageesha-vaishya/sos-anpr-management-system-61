import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/tables/DataTable"
import { 
  Calendar, 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp,
  Settings,
  Tag,
  BarChart3
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const AdvancedAmenityBooking = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("revenue-tracking")

  const revenueStats = [
    {
      title: "Total Revenue This Month",
      value: "₹45,200",
      change: "+18.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Bookings",
      value: "126",
      change: "+22.1%",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Average Revenue per Booking",
      value: "₹358",
      change: "+5.2%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Utilization Rate",
      value: "73%",
      change: "+8.7%",
      icon: BarChart3,
      color: "text-orange-600"
    }
  ]

  const topAmenities = [
    { name: "Community Hall", revenue: "₹18,500", bookings: 45, utilization: "85%" },
    { name: "Swimming Pool", revenue: "₹12,300", bookings: 38, utilization: "67%" },
    { name: "Gym", revenue: "₹8,900", bookings: 28, utilization: "56%" },
    { name: "Tennis Court", revenue: "₹5,500", bookings: 15, utilization: "42%" }
  ]

  const bookingColumns = [
    { key: "date", header: "Date" },
    { key: "time_slot", header: "Time" },
    { key: "amenity", header: "Amenity" },
    { key: "resident", header: "Resident" },
    { key: "status", header: "Status" }
  ]

  const ruleColumns = [
    { key: "name", header: "Rule Name" },
    { key: "amenity", header: "Amenity" },
    { key: "type", header: "Type" },
    { key: "value", header: "Value" },
    { key: "status", header: "Status" }
  ]

  const waitlistColumns = [
    { key: "date", header: "Date" },
    { key: "amenity", header: "Amenity" },
    { key: "resident", header: "Resident" },
    { key: "priority", header: "Priority" },
    { key: "status", header: "Status" }
  ]

  // Mock form component for now
  const MockForm = ({ onSuccess }: { onSuccess: () => void }) => (
    <div className="p-4">
      <p>Form component will be implemented here.</p>
      <Button onClick={onSuccess} className="mt-4">Mock Save</Button>
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Amenity Booking</h1>
            <p className="text-muted-foreground">
              Revenue tracking with dynamic pricing models and promotional offers
            </p>
          </div>
          <Button onClick={() => navigate("/society-books-management")}>
            Back to Books Management
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue-tracking">Revenue Tracking</TabsTrigger>
          <TabsTrigger value="pricing-models">Pricing Models</TabsTrigger>
          <TabsTrigger value="promotions">Promotional Offers</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue-tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown by amenity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{amenity.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {amenity.bookings} bookings • {amenity.utilization} utilization
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">{amenity.revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Revenue management shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Generate Revenue Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Booking Calendar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Analytics Dashboard
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Pricing Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            title="Revenue Transactions"
            tableName="organizations"
            columns={bookingColumns}
            FormComponent={MockForm}
            searchFields={["amenity", "resident"]}
          />
        </TabsContent>

        <TabsContent value="pricing-models" className="space-y-6">
          <DataTable
            title="Dynamic Pricing Models"
            tableName="organizations"
            columns={ruleColumns}
            FormComponent={MockForm}
            searchFields={["name", "amenity"]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Peak Hour Pricing
                </CardTitle>
                <CardDescription>Higher rates during peak hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Button variant="outline">Configure Peak Hours</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Weekend Pricing
                </CardTitle>
                <CardDescription>Special rates for weekends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Button variant="outline">Setup Weekend Rates</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Dynamic Pricing
                </CardTitle>
                <CardDescription>AI-powered pricing optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Button variant="outline">Enable Dynamic Pricing</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <DataTable
            title="Promotional Offers"
            tableName="organizations"
            columns={waitlistColumns}
            FormComponent={MockForm}
            searchFields={["amenity"]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Early Bird Discounts
                </CardTitle>
                <CardDescription>Discounts for advance bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge variant="outline">15% OFF</Badge>
                  <p className="text-sm text-muted-foreground mt-2">7+ days advance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Member Discounts
                </CardTitle>
                <CardDescription>Special rates for residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge variant="outline">10% OFF</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Resident rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Off-Peak Discounts
                </CardTitle>
                <CardDescription>Lower rates during off-peak hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge variant="outline">20% OFF</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Weekday mornings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Bulk Booking
                </CardTitle>
                <CardDescription>Discounts for multiple bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge variant="outline">25% OFF</Badge>
                  <p className="text-sm text-muted-foreground mt-2">5+ bookings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive analytics on amenity usage and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed insights into booking patterns, revenue trends, and optimization opportunities
                </p>
                <div className="space-y-2">
                  <Button>View Analytics Dashboard</Button>
                  <Button variant="outline">Export Analytics Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecasting</CardTitle>
                <CardDescription>Predict future revenue based on trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">Generate Forecast</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Optimization</CardTitle>
                <CardDescription>Identify improvement opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button variant="outline">View Recommendations</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAmenityBooking