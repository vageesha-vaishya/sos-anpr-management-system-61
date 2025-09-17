import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/tables/DataTable"
import { 
  TrendingUp, 
  Plus, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Calendar
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const IncomeTracker = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("income-records")

  const statsCards = [
    {
      title: "Total Income This Month",
      value: "₹87,500",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Maintenance Fees Collected",
      value: "₹75,000",
      change: "+8.2%",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Pending Collections",
      value: "₹25,000",
      change: "-5.1%",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Overdue Payments",
      value: "₹12,000",
      change: "+2.3%",
      icon: AlertCircle,
      color: "text-red-600"
    }
  ]

  const incomeColumns = [
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "source", header: "Source" },
    { key: "description", header: "Description" },
    { key: "status", header: "Status" }
  ]

  const sourceColumns = [
    { key: "name", header: "Source Name" },
    { key: "type", header: "Type" },
    { key: "frequency", header: "Frequency" },
    { key: "amount", header: "Amount" },
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
            <h1 className="text-3xl font-bold mb-2">Income Tracker</h1>
            <p className="text-muted-foreground">
              Track all revenue streams including maintenance fees, late fees, and amenity charges
            </p>
          </div>
          <Button onClick={() => navigate("/financial-hub?tab=books")}>
            Back to Books Management
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
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
          <TabsTrigger value="income-records">Income Records</TabsTrigger>
          <TabsTrigger value="income-sources">Income Sources</TabsTrigger>
          <TabsTrigger value="maintenance-fees">Maintenance Fees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="income-records" className="space-y-6">
          <DataTable
            title="Income Records"
            tableName="organizations"
            columns={incomeColumns}
            FormComponent={MockForm}
            searchFields={["name"]}
          />
        </TabsContent>

        <TabsContent value="income-sources" className="space-y-6">
          <DataTable
            title="Income Sources"
            tableName="organizations"
            columns={sourceColumns}
            FormComponent={MockForm}
            searchFields={["name"]}
          />
        </TabsContent>

        <TabsContent value="maintenance-fees" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Generate Monthly Bills
                </CardTitle>
                <CardDescription>Create maintenance fee bills for all units</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button className="w-full">Generate Bills for Current Month</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Late Fee Management
                </CardTitle>
                <CardDescription>Apply late fees to overdue payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Button variant="outline" className="w-full">Apply Late Fees</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Analytics</CardTitle>
              <CardDescription>Visual insights into revenue trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Income Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Charts and graphs showing income trends, collection rates, and forecasts
                </p>
                <Button>View Detailed Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IncomeTracker