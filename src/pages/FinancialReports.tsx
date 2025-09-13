import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Download,
  FileText,
  Calculator,
  CreditCard
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { addDays, format } from 'date-fns'

const FinancialReports: React.FC = () => {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [reportType, setReportType] = useState('income_statement')

  const generateReport = async () => {
    if (!userProfile || !dateRange?.from || !dateRange?.to) return

    try {
      setLoading(true)
      
      // This would typically fetch financial data from the database
      // For now, we'll show a placeholder
      toast({
        title: 'Report Generated',
        description: `${reportType.replace('_', ' ')} report generated for ${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to generate financial report',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
    { value: 'balance_sheet', label: 'Balance Sheet', icon: Calculator },
    { value: 'cash_flow', label: 'Cash Flow Statement', icon: DollarSign },
    { value: 'trial_balance', label: 'Trial Balance', icon: BarChart3 },
    { value: 'accounts_receivable', label: 'Accounts Receivable', icon: CreditCard },
    { value: 'accounts_payable', label: 'Accounts Payable', icon: FileText },
  ]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports for your organization
          </p>
        </div>
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
          <CardDescription>
            Configure and generate financial reports based on your requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                      : 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Generate</label>
              <Button 
                onClick={generateReport} 
                disabled={loading || !dateRange?.from || !dateRange?.to}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Financial Reports</CardTitle>
              <CardDescription>
                View and download your recently generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for recent reports */}
                <div className="text-center py-8 text-muted-foreground">
                  No recent reports found. Generate your first report above.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((type) => (
              <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate {type.label.toLowerCase()} for the selected period
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setReportType(type.value)
                      generateReport()
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Set up automatic report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Scheduled reports feature coming soon. Contact support for automated reporting needs.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialReports