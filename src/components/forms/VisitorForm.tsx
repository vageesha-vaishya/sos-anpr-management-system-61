import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComingSoonForm } from './ComingSoonForm';

interface VisitorFormProps {
  visitor?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ visitor, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Visitor</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{visitor ? 'Edit Visitor' : 'Add New Visitor'}</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Visitor Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ComingSoonForm 
              title="Visitor Management System"
              description="Comprehensive visitor tracking and management"
              features={["Visitor Registration", "Check-in/Check-out", "Visitor Passes", "Security Clearance", "QR Code Access"]} 
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorForm;