import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Car,
  UserCheck,
  AlertCircle,
  Megaphone,
  MapPin,
  ShoppingCart,
  Shield,
  Bell,
  Settings,
  PhoneCall
} from 'lucide-react';

const ResidentPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickActions = [
    { icon: UserCheck, label: 'Pre-approve Visitor', color: 'bg-blue-500' },
    { icon: CreditCard, label: 'Pay Maintenance', color: 'bg-green-500' },
    { icon: Calendar, label: 'Book Amenity', color: 'bg-purple-500' },
    { icon: AlertCircle, label: 'Raise Complaint', color: 'bg-orange-500' },
    { icon: Car, label: 'Parking Status', color: 'bg-indigo-500' },
    { icon: ShoppingCart, label: 'Community Store', color: 'bg-pink-500' }
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Water Tank Cleaning',
      content: 'Water supply will be affected on Dec 3rd from 10 AM to 4 PM',
      type: 'maintenance',
      date: '2 hours ago',
      urgent: true
    },
    {
      id: 2,
      title: 'Diwali Celebration',
      content: 'Community Diwali celebration on Dec 5th at Club House',
      type: 'event',
      date: '1 day ago',
      urgent: false
    }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Society AGM', date: '2024-12-10', time: '6:00 PM', location: 'Club House' },
    { id: 2, title: 'Kids Christmas Party', date: '2024-12-24', time: '4:00 PM', location: 'Garden Area' }
  ];

  const maintenanceDues = {
    currentMonth: 5500,
    dueDate: '2024-12-10',
    lastPaid: '2024-11-08',
    overdue: 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Resident Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="helpdesk">Helpdesk</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col space-y-2 hover:bg-accent"
                    >
                      <action.icon className={`h-6 w-6 text-white rounded p-1 ${action.color}`} />
                      <span className="text-xs text-center">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Maintenance Dues */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Dues</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">₹{maintenanceDues.currentMonth.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Due: {maintenanceDues.dueDate}</p>
                  <Button className="w-full mt-4" size="sm">Pay Now</Button>
                </CardContent>
              </Card>

              {/* Visitor Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 checked in, 1 pending approval</p>
                  <Button variant="outline" className="w-full mt-4" size="sm">Manage Visitors</Button>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Help</CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full" size="sm">
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Security
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">24/7 Emergency Support</p>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Megaphone className="h-5 w-5" />
                  <span>Recent Announcements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          {announcement.urgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{announcement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.date} at {event.time}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">RSVP</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Payments</CardTitle>
                <CardDescription>Manage your maintenance bills and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Billing management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Management</CardTitle>
                <CardDescription>Pre-approve visitors and manage access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Visitor management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Booking</CardTitle>
                <CardDescription>Book common facilities and view availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Amenity booking interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="helpdesk">
            <Card>
              <CardHeader>
                <CardTitle>Community Helpdesk</CardTitle>
                <CardDescription>Submit and track complaints and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Helpdesk interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>Connect with neighbors and participate in discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Community forum interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Notices</CardTitle>
                <CardDescription>Access important documents and notices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Document management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Community Marketplace</CardTitle>
                <CardDescription>Buy, sell, and exchange items with neighbors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Marketplace interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResidentPortal;