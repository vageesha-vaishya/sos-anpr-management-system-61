import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  FileText, 
  CreditCard, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BillingCustomerForm } from "@/components/forms/BillingCustomerForm";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface BillingStats {
  totalRevenue: number;
  outstandingAmount: number;
  totalCustomers: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export default function Billing() {
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    outstandingAmount: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch organizations
      const { data: orgsData } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      setOrganizations(orgsData || []);

      // Fetch billing customers
      const { data: customersData } = await supabase
        .from("billing_customers")
        .select(`
          *,
          organizations(name)
        `)
        .order("created_at", { ascending: false });
      setCustomers(customersData || []);

      // Fetch recent invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select(`
          *,
          billing_customers(billing_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      setInvoices(invoicesData || []);

      // Calculate stats
      const { data: allInvoices } = await supabase
        .from("invoices")
        .select("total_amount, outstanding_amount, status");

      if (allInvoices) {
        const totalRevenue = allInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        
        const outstandingAmount = allInvoices
          .reduce((sum, inv) => sum + (inv.outstanding_amount || 0), 0);
        
        const paidInvoices = allInvoices.filter(inv => inv.status === 'paid').length;
        const pendingInvoices = allInvoices.filter(inv => inv.status === 'sent').length;
        
        setStats({
          totalRevenue,
          outstandingAmount,
          totalCustomers: customersData?.length || 0,
          totalInvoices: allInvoices.length,
          paidInvoices,
          pendingInvoices,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCustomerSuccess = () => {
    setCustomerDialogOpen(false);
    setEditingCustomer(null);
    fetchData();
  };

  const handleInvoiceSuccess = () => {
    setInvoiceDialogOpen(false);
    setEditingInvoice(null);
    fetchData();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const processPayment = async (invoiceId: string) => {
    try {
      // This would integrate with Stripe or other payment processor
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          invoice_id: invoiceId,
          amount: invoices.find(inv => inv.id === invoiceId)?.outstanding_amount 
        }
      });

      if (error) throw error;

      // Open payment URL in new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }

      toast({
        title: "Payment Initiated",
        description: "Redirecting to payment processor...",
      });
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Billing</h1>
            <p className="text-muted-foreground">Manage customers, invoices, and payments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Billing Management</h1>
          <p className="text-muted-foreground">Manage customers, invoices, and payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setCustomerDialogOpen(true)}
            variant="outline"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <Button onClick={() => setInvoiceDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  $<AnimatedCounter value={stats.totalRevenue} />
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  $<AnimatedCounter value={stats.outstandingAmount} />
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">
                  <AnimatedCounter value={stats.totalCustomers} />
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">
                  <AnimatedCounter value={stats.totalInvoices} />
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Invoices</span>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {invoice.billing_customers?.billing_name}
                        </TableCell>
                        <TableCell>
                          ${invoice.total_amount?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setInvoiceDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            {invoice.status !== 'paid' && invoice.outstanding_amount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => processPayment(invoice.id)}
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No invoices found. Create your first invoice to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Billing Customers</span>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.length > 0 ? (
                <div className="space-y-2">
                  {customers.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setCustomerDialogOpen(true);
                      }}
                    >
                      <div>
                        <p className="font-medium">{customer.billing_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.organizations?.name} • {customer.customer_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${customer.current_balance?.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {customers.length > 5 && (
                    <div className="text-center py-2">
                      <Button variant="ghost" size="sm">
                        View All ({customers.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No customers found. Add your first customer to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <BillingCustomerForm
            customer={editingCustomer}
            organizations={organizations}
            onSuccess={handleCustomerSuccess}
            onCancel={() => {
              setCustomerDialogOpen(false);
              setEditingCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
            </DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={editingInvoice}
            customers={customers}
            onSuccess={handleInvoiceSuccess}
            onCancel={() => {
              setInvoiceDialogOpen(false);
              setEditingInvoice(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}