import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, UserPlus, Eye, Clock, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import VisitorForm from '@/components/forms/VisitorForm';

interface Visitor {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  visit_count: number;
  last_visit_date?: string;
  security_status: string;
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
  host_id?: string;
  purpose?: string;
  check_in_time?: string;
  check_out_time?: string;
}

const Visitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedData = (data || []).map(visitor => ({
        ...visitor,
        first_name: visitor.first_name || visitor.visitor_name?.split(' ')[0] || '',
        last_name: visitor.last_name || visitor.visitor_name?.split(' ').slice(1).join(' ') || '',
        email: visitor.email || visitor.visitor_email || '',
        phone: visitor.phone || visitor.visitor_phone || '',
        security_status: visitor.security_status || 'pending'
      }));
      
      setVisitors(mappedData);
    } catch (error) {
      console.error('Error loading visitors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load visitors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    `${visitor.first_name} ${visitor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSecurityStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'bg-success text-success-foreground';
      case 'flagged': return 'bg-warning text-warning-foreground';
      case 'blocked': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDeleteVisitor = async (visitorId: string) => {
    if (!confirm('Are you sure you want to delete this visitor?')) return;

    try {
      const { error } = await supabase
        .from('visitors')
        .delete()
        .eq('id', visitorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Visitor deleted successfully',
      });

      loadVisitors();
    } catch (error) {
      console.error('Error deleting visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete visitor',
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
          <h1 className="text-3xl font-bold">Visitors</h1>
        </div>
        <VisitorForm 
          onSuccess={loadVisitors}
          trigger={
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Visitor</span>
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitor Directory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search visitors..."
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
                <TableHead>Company</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">
                    {visitor.first_name} {visitor.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {visitor.email && <div className="text-sm">{visitor.email}</div>}
                      {visitor.phone && <div className="text-sm text-muted-foreground">{visitor.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{visitor.company || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{visitor.visit_count}</Badge>
                  </TableCell>
                  <TableCell>
                    {visitor.last_visit_date ? (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(visitor.last_visit_date).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSecurityStatusColor(visitor.security_status)}>
                      {visitor.security_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <VisitorForm 
                        visitor={visitor}
                        onSuccess={loadVisitors}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteVisitor(visitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredVisitors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No visitors found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Visitors;