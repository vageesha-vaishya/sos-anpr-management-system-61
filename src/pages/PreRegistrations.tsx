
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, User, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PreRegistration {
  id: string;
  organization_id: string;
  location_id?: string | null;
  visitor_name: string;
  visitor_email?: string | null;
  visitor_phone?: string | null;
  company?: string | null;
  purpose: string;
  scheduled_date: string;
  scheduled_time?: string | null;
  duration_hours?: number | null;
  group_size?: number | null;
  host_id?: string | null;
  status: string;
  visitor_details?: any;
  special_requirements?: string | null;
  created_by?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
}

const PreRegistrations = () => {
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPreRegistrations();
  }, [userProfile]);

  const fetchPreRegistrations = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('pre_registrations')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      setPreRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching pre-registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pre-registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not specified';
    return timeString;
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
          <h1 className="text-3xl font-bold">Pre-Registrations</h1>
          <p className="text-muted-foreground">Manage scheduled visitor pre-registrations</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Pre-Registration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Pre-Registration</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-muted-foreground">Pre-registration form will be implemented here.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No pre-registrations found
                  </TableCell>
                </TableRow>
              ) : (
                preRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {registration.visitor_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {registration.company || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(registration.scheduled_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(registration.scheduled_time)}
                      </div>
                    </TableCell>
                    <TableCell>{registration.duration_hours || 1}h</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(registration.status)}>
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {registration.status === 'pending' && (
                          <>
                            <Button variant="default" size="sm">
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreRegistrations;
