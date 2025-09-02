import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Search, Users, Phone, Mail, Building, UserCheck, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import HostForm from '@/components/forms/HostForm';

interface Host {
  id: string;
  user_id: string;
  availability_status: string;
  department?: string;
  job_title?: string;
  phone?: string;
  auto_approve_visitors: boolean;
  notification_preferences: any;
  // From profiles table
  profiles?: any;
}

const Hosts = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      setLoading(true);
      // First get hosts
      const { data: hostsData, error: hostsError } = await (supabase as any)
        .from('hosts')
        .select('*')
        .eq('organization_id', userProfile?.organization_id)
        .order('created_at', { ascending: false });

      if (hostsError) throw hostsError;

      // Then get profiles for each host
      if (hostsData && hostsData.length > 0) {
        const userIds = (hostsData as any[]).map((host: any) => host.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const hostsWithProfiles = (hostsData as any[]).map((host: any) => ({
          ...host,
          user_id: host.user_id,
          availability_status: host.availability_status || 'available',
          auto_approve_visitors: host.auto_approve_visitors || false,
          notification_preferences: host.notification_preferences || {},
          profiles: (profilesData as any[])?.find((profile: any) => profile.id === host.user_id)
        }));

        setHosts(hostsWithProfiles as any);
      } else {
        setHosts([]);
      }
    } catch (error) {
      console.error('Error loading hosts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hosts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHosts = hosts.filter(host =>
    host.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'unavailable': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const updateAvailability = async (hostId: string, status: string) => {
    try {
      const { error } = await (supabase as any)
        .from('hosts')
        .update({ availability_status: status } as any)
        .eq('id', hostId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Host availability updated',
      });

      loadHosts();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    if (!confirm('Are you sure you want to delete this host?')) return;

    try {
      const { error } = await (supabase as any)
        .from('hosts')
        .delete()
        .eq('id', hostId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Host deleted successfully',
      });

      loadHosts();
    } catch (error) {
      console.error('Error deleting host:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete host',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
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
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Hosts</h1>
        </div>
        <HostForm 
          onSuccess={loadHosts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hosts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {hosts.filter(h => h.availability_status === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Busy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {hosts.filter(h => h.availability_status === 'busy').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {hosts.filter(h => h.availability_status === 'unavailable').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Host Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hosts..."
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
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto Approve</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHosts.map((host) => (
                <TableRow key={host.id}>
                  <TableCell className="font-medium">
                    {host.profiles?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{host.profiles?.email}</span>
                      </div>
                      {host.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-sm text-muted-foreground">{host.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {host.department && (
                      <div className="flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{host.department}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{host.job_title || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getAvailabilityColor(host.availability_status)}>
                      {host.availability_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {host.auto_approve_visitors ? (
                      <Badge variant="outline" className="bg-success/10 text-success">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Auto
                      </Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant={host.availability_status === 'available' ? 'default' : 'outline'}
                        onClick={() => updateAvailability(host.id, 'available')}
                      >
                        Available
                      </Button>
                      <Button
                        size="sm"
                        variant={host.availability_status === 'busy' ? 'default' : 'outline'}
                        onClick={() => updateAvailability(host.id, 'busy')}
                      >
                        Busy
                      </Button>
                      <HostForm 
                        onSuccess={loadHosts}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteHost(host.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredHosts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hosts found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Hosts;