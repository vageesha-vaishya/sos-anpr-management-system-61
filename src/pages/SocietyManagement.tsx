
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Users, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SocietyUnitsTable } from '@/components/tables/SocietyUnitsTable';
import { MaintenanceChargeForm } from '@/components/forms/MaintenanceChargeForm';

interface SocietyUnit {
  id: string;
  building_id: string;
  unit_number: string;
  unit_type?: string | null;
  floor?: number | null;
  area_sqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;
  tenant_name?: string | null;
  tenant_email?: string | null;
  tenant_phone?: string | null;
  is_occupied: boolean;
  monthly_maintenance?: number | null;
  monthly_rate_per_sqft: number;
  monthly_flat_rate: number;
  parking_slots: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MaintenanceCharge {
  id: string;
  organization_id: string;
  unit_id: string;
  charge_category_id?: string | null;
  amount: number;
  billing_period: string;
  due_date?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const SocietyManagement = () => {
  const [units, setUnits] = useState<SocietyUnit[]>([]);
  const [maintenanceCharges, setMaintenanceCharges] = useState<MaintenanceCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<MaintenanceCharge | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    if (!userProfile?.organization_id) return;

    try {
      setLoading(true);

      // Fetch units
      const { data: unitsData, error: unitsError } = await supabase
        .from('society_units')
        .select('*')
        .order('unit_number');

      if (unitsError) throw unitsError;

      // Fetch maintenance charges
      const { data: chargesData, error: chargesError } = await supabase
        .from('maintenance_charges')
        .select('*')
        .order('created_at', { ascending: false });

      if (chargesError) throw chargesError;

      setUnits(unitsData || []);
      setMaintenanceCharges(chargesData || []);

    } catch (error) {
      console.error('Error fetching society data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load society data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getChargeStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Society Management</h1>
          <p className="text-muted-foreground">Manage units, residents, and maintenance charges</p>
        </div>
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {units.filter(unit => unit.is_occupied).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceCharges.filter(charge => charge.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${maintenanceCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units Management</TabsTrigger>
          <TabsTrigger value="charges">Maintenance Charges</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Society Units</CardTitle>
            </CardHeader>
            <CardContent>
              <SocietyUnitsTable units={units} onRefresh={fetchData} organizationId={userProfile?.organization_id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Maintenance Charges</h2>
            <Dialog open={showChargeForm} onOpenChange={setShowChargeForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCharge ? "Edit Maintenance Charge" : "Add New Maintenance Charge"}
                  </DialogTitle>
                </DialogHeader>
                <MaintenanceChargeForm
                  charge={selectedCharge}
                  units={units}
                  onSuccess={() => {
                    setShowChargeForm(false);
                    setSelectedCharge(null);
                    fetchData();
                  }}
                  onCancel={() => {
                    setShowChargeForm(false);
                    setSelectedCharge(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Unit</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceCharges.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No maintenance charges found
                        </td>
                      </tr>
                    ) : (
                      maintenanceCharges.map((charge) => (
                        <tr key={charge.id} className="border-b">
                          <td className="px-4 py-3 font-medium">
                            {units.find(u => u.id === charge.unit_id)?.unit_number || 'Unknown'}
                          </td>
                          <td className="px-4 py-3">${charge.amount}</td>
                          <td className="px-4 py-3">{charge.billing_period}</td>
                          <td className="px-4 py-3">
                            {charge.due_date ? new Date(charge.due_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getChargeStatusVariant(charge.status)}>
                              {charge.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCharge(charge);
                                  setShowChargeForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocietyManagement;
