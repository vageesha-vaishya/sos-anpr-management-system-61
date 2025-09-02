import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChargeCategoryForm } from '@/components/forms/ChargeCategoryForm';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Download,
  Send,
  Plus,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Receipt
} from 'lucide-react';

const MaintenanceBilling = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const billingStats = {
    totalAmount: 2450000,
    collectedAmount: 2100000,
    pendingAmount: 350000,
    overdueAmount: 125000,
    collectionRate: 85.7,
    totalUnits: 120
  };

  const bills = [
    {
      id: 1,
      unitNumber: 'A-301',
      ownerName: 'John Doe',
      period: 'Dec 2024',
      totalAmount: 5500,
      paidAmount: 5500,
      dueDate: '2024-12-10',
      status: 'paid',
      paymentDate: '2024-12-05',
      breakdown: {
        maintenance: 4000,
        utilities: 800,
        parking: 500,
        amenities: 200
      }
    },
    {
      id: 2,
      unitNumber: 'B-205',
      ownerName: 'Jane Smith',
      period: 'Dec 2024',
      totalAmount: 6200,
      paidAmount: 0,
      dueDate: '2024-12-10',
      status: 'pending',
      paymentDate: null,
      breakdown: {
        maintenance: 4500,
        utilities: 900,
        parking: 500,
        amenities: 300
      }
    },
    {
      id: 3,
      unitNumber: 'C-104',
      ownerName: 'Mike Wilson',
      period: 'Dec 2024',
      totalAmount: 4800,
      paidAmount: 0,
      dueDate: '2024-11-10',
      status: 'overdue',
      paymentDate: null,
      breakdown: {
        maintenance: 3500,
        utilities: 700,
        parking: 400,
        amenities: 200
      }
    },
    {
      id: 4,
      unitNumber: 'A-150',
      ownerName: 'Sarah Davis',
      period: 'Dec 2024',
      totalAmount: 7100,
      paidAmount: 3500,
      dueDate: '2024-12-10',
      status: 'partial',
      paymentDate: '2024-12-08',
      breakdown: {
        maintenance: 5000,
        utilities: 1200,
        parking: 600,
        amenities: 300
      }
    }
  ];

  const chargeCategories = [
    { id: 1, name: 'Maintenance Charges', type: 'fixed', amount: 4000, mandatory: true },
    { id: 2, name: 'Utility Charges', type: 'variable', amount: 0, mandatory: true },
    { id: 3, name: 'Parking Charges', type: 'fixed', amount: 500, mandatory: false },
    { id: 4, name: 'Amenity Charges', type: 'fixed', amount: 200, mandatory: false },
    { id: 5, name: 'Security Charges', type: 'per_sq_ft', amount: 2, mandatory: true }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      'paid': 'default',
      'pending': 'secondary',
      'overdue': 'destructive',
      'partial': 'outline'
    };
    const colors = {
      'paid': 'text-green-600',
      'pending': 'text-yellow-600',
      'overdue': 'text-red-600',
      'partial': 'text-blue-600'
    };
    return <Badge variant={variants[status]} className={colors[status]}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'paid': CheckCircle,
      'pending': Clock,
      'overdue': XCircle,
      'partial': AlertCircle
    };
    const Icon = icons[status];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance Billing</h1>
            <p className="text-muted-foreground">Manage society maintenance bills and collections</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Bills
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Bills
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Monthly Bills</DialogTitle>
                  <DialogDescription>Create maintenance bills for all units</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-month">Billing Month</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jan-2025">January 2025</SelectItem>
                        <SelectItem value="dec-2024">December 2024</SelectItem>
                        <SelectItem value="nov-2024">November 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Include Charges</Label>
                    <div className="space-y-2">
                      {chargeCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={category.mandatory} />
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.type === 'fixed' ? `₹${category.amount}` : category.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Generate Bills</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{billingStats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{billingStats.totalUnits} units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{billingStats.collectedAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{billingStats.collectionRate}% collection rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₹{billingStats.pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current month dues</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{billingStats.overdueAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Past due amounts</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bills">Bills Management</TabsTrigger>
            <TabsTrigger value="charges">Charge Categories</TabsTrigger>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Overview</CardTitle>
                  <CardDescription>Monthly collection status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Collection Progress</span>
                      <span className="text-sm text-muted-foreground">{billingStats.collectionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full" 
                        style={{ width: `${billingStats.collectionRate}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">₹{billingStats.collectedAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Collected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">₹{billingStats.pendingAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Distribution</CardTitle>
                  <CardDescription>Units by payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'paid', count: 85, percentage: 71 },
                      { status: 'pending', count: 25, percentage: 21 },
                      { status: 'overdue', count: 8, percentage: 7 },
                      { status: 'partial', count: 2, percentage: 1 }
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <span className="text-sm capitalize">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{item.count} units</span>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Bills Management</CardTitle>
                    <CardDescription>View and manage maintenance bills</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Month</SelectItem>
                        <SelectItem value="previous">Previous Month</SelectItem>
                        <SelectItem value="all">All Periods</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.unitNumber}</TableCell>
                        <TableCell>{bill.ownerName}</TableCell>
                        <TableCell>{bill.period}</TableCell>
                        <TableCell>₹{bill.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{bill.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Charge Categories</CardTitle>
                    <CardDescription>Configure billing charges and rates</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Charge
                      </Button>
                    </DialogTrigger>
                     <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                       <DialogHeader>
                         <DialogTitle>Add New Charge Category</DialogTitle>
                         <DialogDescription>Create a new billing charge type</DialogDescription>
                       </DialogHeader>
                        <ChargeCategoryForm 
                          onSuccess={() => window.location.reload()} 
                        />
                     </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chargeCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.type === 'fixed' && `₹${category.amount} fixed`}
                          {category.type === 'variable' && 'Variable amount'}
                          {category.type === 'per_sq_ft' && `₹${category.amount} per sq ft`}
                          {category.type === 'percentage' && `${category.amount}% of base`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {category.mandatory && <Badge>Mandatory</Badge>}
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Tracking</CardTitle>
                <CardDescription>Track and reconcile payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Payment Tracking</p>
                  <p className="text-muted-foreground">Payment reconciliation interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Billing Reports</CardTitle>
                <CardDescription>Generate and download billing reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Billing Analytics</p>
                  <p className="text-muted-foreground">Detailed billing reports and analytics will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MaintenanceBilling;