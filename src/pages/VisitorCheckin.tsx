
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Camera, IdCard, Users, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CheckinForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  hostId: string;
  visitType: string;
  expectedDuration: number;
}

interface Visitor {
  id: string;
  organization_id: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  company?: string;
  purpose: string;
  host_id?: string;
  check_in_time?: string;
  check_out_time?: string;
  visit_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const VisitorCheckin = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckinForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    hostId: '',
    visitType: 'individual',
    expectedDuration: 60
  });
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof CheckinForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.organization_id) {
        throw new Error('No organization found');
      }

      // Create or update visitor record
      const visitorName = `${form.firstName} ${form.lastName}`;
      let visitor: Visitor;

      if (form.email) {
        // Check if visitor exists by email
        const { data: existingVisitor } = await supabase
          .from('visitors')
          .select('*')
          .eq('visitor_email', form.email)
          .maybeSingle();

        if (existingVisitor) {
          // Update existing visitor
          const { data: updatedVisitor, error: updateError } = await supabase
            .from('visitors')
            .update({
              visitor_name: visitorName,
              visitor_phone: form.phone,
              company: form.company,
              visit_count: (existingVisitor.visit_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingVisitor.id)
            .select()
            .single();

          if (updateError) throw updateError;
          visitor = updatedVisitor;
        } else {
          // Create new visitor
          const { data: newVisitor, error: createError } = await supabase
            .from('visitors')
            .insert({
              organization_id: userProfile.organization_id,
              visitor_name: visitorName,
              visitor_email: form.email,
              visitor_phone: form.phone,
              company: form.company,
              purpose: form.purpose,
              host_id: form.hostId || null,
              visit_count: 1,
              status: 'checked_in',
              check_in_time: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          visitor = newVisitor;
        }
      } else {
        // Create new visitor without email
        const { data: newVisitor, error: createError } = await supabase
          .from('visitors')
          .insert({
            organization_id: userProfile.organization_id,
            visitor_name: visitorName,
            visitor_phone: form.phone,
            company: form.company,
            purpose: form.purpose,
            host_id: form.hostId || null,
            visit_count: 1,
            status: 'checked_in',
            check_in_time: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        visitor = newVisitor;
      }

      toast({
        title: 'Success',
        description: 'Visitor checked in successfully',
      });

      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        hostId: '',
        visitType: 'individual',
        expectedDuration: 60
      });
      setStep(1);

    } catch (error) {
      console.error('Error during check-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in visitor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Textarea
                id="purpose"
                value={form.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Enter purpose of visit"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="visitType">Visit Type</Label>
              <Select value={form.visitType} onValueChange={(value) => handleInputChange('visitType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Expected Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={form.expectedDuration}
                onChange={(e) => handleInputChange('expectedDuration', parseInt(e.target.value) || 0)}
                placeholder="60"
                min="15"
                max="480"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Photo Capture</h3>
              <p className="text-muted-foreground mb-4">
                Please position yourself in front of the camera for your visitor badge photo
              </p>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <UserCheck className="h-16 w-16 mx-auto text-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{form.firstName} {form.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{form.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{form.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purpose:</span>
                <span className="font-medium">{form.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{form.expectedDuration} minutes</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <UserCheck className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Visitor Check-in</h1>
        <p className="text-muted-foreground">Welcome! Please complete your check-in process</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Details</span>
          <span>Visit Info</span>
          <span>Photo</span>
          <span>Confirm</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {step} of 4: {
              step === 1 ? 'Personal Details' :
              step === 2 ? 'Visit Information' :
              step === 3 ? 'Photo Capture' :
              'Confirmation'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Checking In...' : 'Complete Check-in'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorCheckin;
