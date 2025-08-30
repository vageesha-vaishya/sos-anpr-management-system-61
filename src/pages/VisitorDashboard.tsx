import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  Eye,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
  overdueVisitors: number;
}

interface RecentVisit {
  id: string;
  visitors: {
    first_name: string;
    last_name: string;
    company?: string;
  } | null;
  purpose: string;
  status: string;
  check_in_time?: string;
  expected_checkout_time?: string;
  created_at: string;
}

const VisitorDashboard = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
    overdueVisitors: 0
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('visitor-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'visits' },
        () => loadDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load today's visits with visitor details
      const today = new Date().toISOString().split('T')[0];
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select(`
          *,
          visitors(first_name, last_name, company)
        `)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (visitsError) throw visitsError;

      const visitsData = visits || [];
      
      // Calculate stats
      const statsData: VisitorStats = {
        totalVisitors: visitsData.length,
        checkedIn: visitsData.filter(v => v.status === 'checked_in').length,
        checkedOut: visitsData.filter(v => v.status === 'checked_out').length,
        pending: visitsData.filter(v => v.status === 'registered' || v.status === 'approved').length,
        overdueVisitors: visitsData.filter(v => {
          if (!v.expected_checkout_time || v.status === 'checked_out') return false;
          return new Date(v.expected_checkout_time) < new Date();
        }).length
      };

      setStats(statsData);
      setRecentVisits(visitsData.slice(0, 10));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'bg-success text-success-foreground';
      case 'checked_out': return 'bg-muted text-muted-foreground';
      case 'approved': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCheckOut = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          status: 'checked_out',
          check_out_time: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Visitor checked out successfully',
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to check out visitor',
        variant: 'destructive',
      });
    }
  };

  const statCards = [
    {
      title: "Total Visitors Today",
      value: stats.totalVisitors,
      description: "All registered visitors",
      icon: Users,
      variant: "default" as const
    },
    {
      title: "Currently On-Site",
      value: stats.checkedIn,
      description: "Active visitors in building",
      icon: UserCheck,
      variant: "success" as const
    },
    {
      title: "Checked Out",
      value: stats.checkedOut,
      description: "Completed visits today",
      icon: UserX,
      variant: "default" as const
    },
    {
      title: "Pending Approval",
      value: stats.pending,
      description: "Awaiting host approval",
      icon: Clock,
      variant: "warning" as const
    },
    {
      title: "Overdue Visitors",
      value: stats.overdueVisitors,
      description: "Past expected checkout",
      icon: AlertTriangle,
      variant: "destructive" as const
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visitor Dashboard</h1>
          <p className="text-muted-foreground">Real-time visitor management and tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            Live Updates
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            variant={card.variant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Visits</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {visit.visitors?.first_name} {visit.visitors?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {visit.visitors?.company} • {visit.purpose}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(visit.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(visit.status)}>
                      {visit.status.replace('_', ' ')}
                    </Badge>
                    {visit.status === 'checked_in' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(visit.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {recentVisits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No visits today
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex-col">
                <UserCheck className="h-6 w-6 mb-2" />
                Manual Check-in
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Timer className="h-6 w-6 mb-2" />
                Emergency Roll Call
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Eye className="h-6 w-6 mb-2" />
                Live Monitoring
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Security Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitorDashboard;