import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PreRegistration {
  id: string;
  scheduled_date: string;
  scheduled_time?: string;
  purpose: string;
  visitor_details: any;
  group_size: number;
  status: string;
  approval_deadline?: string;
  expected_duration_minutes?: number;
  created_at: string;
  // Relations
  host_id: string;
  location_id: string;
}

const PreRegistrations = () => {
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPreRegistrations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('pre-registrations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pre_registrations' },
        () => loadPreRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPreRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pre_registrations')
        .select('*')
        .eq('organization_id', userProfile?.organization_id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setPreRegistrations(data || []);
    } catch (error) {
      console.error('Error loading pre-registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pre-registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPreRegistrations = preRegistrations.filter(registration => {
    const matchesSearch = 
      registration.visitor_details?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitor_details?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitor_details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitor_details?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'expired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('pre_registrations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userProfile?.id
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pre-registration approved',
      });

      loadPreRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve registration',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('pre_registrations')
        .update({
          status: 'rejected',
          approved_by: userProfile?.id,
          rejection_reason: 'Rejected by host'
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pre-registration rejected',
      });

      loadPreRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject registration',
        variant: 'destructive',
      });
    }
  };

  const statusCounts = {
    all: preRegistrations.length,
    pending: preRegistrations.filter(r => r.status === 'pending').length,
    approved: preRegistrations.filter(r => r.status === 'approved').length,
    rejected: preRegistrations.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Pre-Registrations</h1>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Registration</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={statusFilter === 'all' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              className="h-auto p-0 flex flex-col items-start"
              onClick={() => setStatusFilter('all')}
            >
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm text-muted-foreground">All registrations</div>
            </Button>
          </CardContent>
        </Card>

        <Card className={statusFilter === 'pending' ? 'ring-2 ring-warning' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              className="h-auto p-0 flex flex-col items-start"
              onClick={() => setStatusFilter('pending')}
            >
              <div className="text-2xl font-bold text-warning">{statusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Awaiting approval</div>
            </Button>
          </CardContent>
        </Card>

        <Card className={statusFilter === 'approved' ? 'ring-2 ring-success' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              className="h-auto p-0 flex flex-col items-start"
              onClick={() => setStatusFilter('approved')}
            >
              <div className="text-2xl font-bold text-success">{statusCounts.approved}</div>
              <div className="text-sm text-muted-foreground">Ready for visit</div>
            </Button>
          </CardContent>
        </Card>

        <Card className={statusFilter === 'rejected' ? 'ring-2 ring-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              className="h-auto p-0 flex flex-col items-start"
              onClick={() => setStatusFilter('rejected')}
            >
              <div className="text-2xl font-bold text-destructive">{statusCounts.rejected}</div>
              <div className="text-sm text-muted-foreground">Declined visits</div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registration Requests</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Group Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{registration.visitor_details?.first_name} {registration.visitor_details?.last_name}</div>
                      <div className="text-sm text-muted-foreground">{registration.visitor_details?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{registration.visitor_details?.company || '-'}</TableCell>
                  <TableCell>{registration.purpose}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {new Date(registration.scheduled_date).toLocaleDateString()}
                        {registration.scheduled_time && (
                          <div className="text-xs text-muted-foreground">
                            {registration.scheduled_time}
                          </div>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {registration.expected_duration_minutes ? (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{registration.expected_duration_minutes}m</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{registration.group_size}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(registration.status)}>
                      {registration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {registration.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(registration.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(registration.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPreRegistrations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pre-registrations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreRegistrations;