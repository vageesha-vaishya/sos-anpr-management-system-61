import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HostFormData {
  user_id: string;
  full_name: string;
  email: string;
  department?: string;
  job_title?: string;
  phone?: string;
  availability_status: string;
  auto_approve_visitors: boolean;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface HostFormProps {
  host?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const HostForm: React.FC<HostFormProps> = ({ host, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<HostFormData>({
    defaultValues: {
      user_id: host?.user_id || '',
      full_name: host?.profiles?.full_name || '',
      email: host?.profiles?.email || '',
      department: host?.department || '',
      job_title: host?.job_title || '',
      phone: host?.phone || '',
      availability_status: host?.availability_status || 'available',
      auto_approve_visitors: host?.auto_approve_visitors || false,
      notification_preferences: host?.notification_preferences || {
        email: true,
        sms: false,
        push: true,
      },
    },
  });

  useEffect(() => {
    if (open && !host) {
      loadAvailableUsers();
    }
  }, [open, host]);

  const loadAvailableUsers = async () => {
    try {
      // First get all existing host user IDs
      const { data: existingHosts, error: hostsError } = await supabase
        .from('hosts')
        .select('user_id')
        .eq('organization_id', userProfile?.organization_id);

      if (hostsError) throw hostsError;

      const existingUserIds = existingHosts?.map(host => host.user_id) || [];

      // Then get profiles that are not already hosts
      const profilesQuery = supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', userProfile?.organization_id);

      if (existingUserIds.length > 0) {
        profilesQuery.not('id', 'in', `(${existingUserIds.join(',')})`);
      }

      const { data, error } = await profilesQuery;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available users',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: HostFormData) => {
    try {
      setLoading(true);

      const hostData = {
        user_id: data.user_id,
        organization_id: userProfile?.organization_id,
        department: data.department,
        job_title: data.job_title,
        phone: data.phone,
        availability_status: data.availability_status,
        auto_approve_visitors: data.auto_approve_visitors,
        notification_preferences: data.notification_preferences,
      };

      if (host) {
        // Update existing host
        const { error } = await supabase
          .from('hosts')
          .update(hostData)
          .eq('id', host.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Host updated successfully',
        });
      } else {
        // Create new host
        const { error } = await supabase
          .from('hosts')
          .insert([hostData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Host created successfully',
        });
      }

      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error saving host:', error);
      toast({
        title: 'Error',
        description: 'Failed to save host',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Host</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{host ? 'Edit Host' : 'Add New Host'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!host && (
              <FormField
                control={form.control}
                name="user_id"
                rules={{ required: 'User is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user to make host" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_approve_visitors"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto Approve Visitors</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Automatically approve visitor requests for this host
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label className="text-base font-medium">Notification Preferences</Label>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notification_preferences.email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Receive visitor notifications via email
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notification_preferences.sms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>SMS Notifications</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Receive visitor notifications via SMS
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notification_preferences.push"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Push Notifications</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Receive visitor notifications via push notifications
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : host ? 'Update Host' : 'Create Host'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HostForm;