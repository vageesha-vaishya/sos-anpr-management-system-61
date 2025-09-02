import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, Users, MapPin, DollarSign, Settings, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AmenityManagement = () => {
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const amenities = [
    {
      id: 1,
      name: 'Swimming Pool',
      type: 'recreation',
      capacity: 25,
      hourlyRate: 100,
      status: 'active',
      description: 'Olympic size swimming pool with changing rooms',
      bookings: 15,
      revenue: 1500,
      availability: 80
    },
    {
      id: 2,
      name: 'Community Hall',
      type: 'event_space',
      capacity: 100,
      hourlyRate: 500,
      status: 'active',
      description: 'Large hall for events and meetings',
      bookings: 8,
      revenue: 4000,
      availability: 60
    },
    {
      id: 3,
      name: 'Gymnasium',
      type: 'fitness',
      capacity: 15,
      hourlyRate: 50,
      status: 'maintenance',
      description: 'Fully equipped fitness center',
      bookings: 0,
      revenue: 0,
      availability: 0
    },
    {
      id: 4,
      name: 'Tennis Court',
      type: 'sports',
      capacity: 4,
      hourlyRate: 200,
      status: 'active',
      description: 'Professional tennis court with lighting',
      bookings: 12,
      revenue: 2400,
      availability: 70
    }
  ];

  const bookings = [
    {
      id: 1,
      amenityName: 'Swimming Pool',
      resident: 'John Doe (A-301)',
      date: '2024-12-05',
      time: '6:00 PM - 8:00 PM',
      guests: 2,
      amount: 200,
      status: 'confirmed'
    },
    {
      id: 2,
      amenityName: 'Community Hall',
      resident: 'Jane Smith (B-205)',
      date: '2024-12-08',
      time: '10:00 AM - 2:00 PM',
      guests: 50,
      amount: 2000,
      status: 'pending'
    },
    {
      id: 3,
      amenityName: 'Tennis Court',
      resident: 'Mike Wilson (C-104)',
      date: '2024-12-03',
      time: '7:00 AM - 8:00 AM',
      guests: 1,
      amount: 200,
      status: 'completed'
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'default',
      'maintenance': 'destructive',
      'inactive': 'secondary',
      'confirmed': 'default',
      'pending': 'secondary',
      'completed': 'outline',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'recreation': '🏊',
      'event_space': '🎪',
      'fitness': '💪',
      'sports': '🎾',
      'utility': '🔧'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Amenity Management</h1>
            <p className="text-muted-foreground">Manage community facilities and bookings</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Amenity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Amenity</DialogTitle>
                <DialogDescription>Create a new amenity for residents to book</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Amenity Name</Label>
                  <Input id="name" placeholder="e.g., Swimming Pool" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recreation">Recreation</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="event_space">Event Space</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="Maximum occupancy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate (₹)</Label>
                  <Input id="rate" type="number" placeholder="Cost per hour" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the amenity" />
                </div>
                <Button className="w-full">Create Amenity</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amenities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{amenities.length}</div>
              <p className="text-xs text-muted-foreground">
                {amenities.filter(a => a.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month's Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{amenities.reduce((sum, a) => sum + a.revenue, 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(amenities.reduce((sum, a) => sum + a.availability, 0) / amenities.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all amenities
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((amenity) => (
                <Card key={amenity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(amenity.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{amenity.name}</CardTitle>
                          <CardDescription>{amenity.type.replace('_', ' ')}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(amenity.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{amenity.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Capacity:</span>
                        <p className="text-muted-foreground">{amenity.capacity} people</p>
                      </div>
                      <div>
                        <span className="font-medium">Rate:</span>
                        <p className="text-muted-foreground">₹{amenity.hourlyRate}/hour</p>
                      </div>
                      <div>
                        <span className="font-medium">Bookings:</span>
                        <p className="text-muted-foreground">{amenity.bookings} this month</p>
                      </div>
                      <div>
                        <span className="font-medium">Utilization:</span>
                        <p className="text-muted-foreground">{amenity.availability}%</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage amenity reservations and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{booking.amenityName}</h4>
                            <p className="text-sm text-muted-foreground">{booking.resident}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">{booking.date}</p>
                            <p className="text-muted-foreground">{booking.time}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">₹{booking.amount}</p>
                            <p className="text-muted-foreground">{booking.guests} guests</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
                <CardDescription>View amenity availability and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Calendar View</p>
                  <p className="text-muted-foreground">Interactive calendar for amenity bookings will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Amenity Reports</CardTitle>
                <CardDescription>Analytics and insights on amenity usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Usage Analytics</p>
                  <p className="text-muted-foreground">Detailed reports and analytics will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AmenityManagement;