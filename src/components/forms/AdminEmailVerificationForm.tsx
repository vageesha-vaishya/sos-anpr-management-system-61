import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  full_name?: string;
}

interface AdminEmailVerificationFormProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminEmailVerificationForm({
  user,
  open,
  onOpenChange,
  onSuccess
}: AdminEmailVerificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const isVerified = user?.email_confirmed_at !== null;

  const handleSubmit = async (action: 'verify' | 'unverify') => {
    if (!user || !reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for this action.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await supabase.functions.invoke('admin-email-verification', {
        body: {
          userId: user.id,
          action,
          reason: reason.trim(),
          notifyUser: false
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update email verification');
      }

      toast({
        title: "Success",
        description: `Email ${action === 'verify' ? 'verified' : 'unverified'} successfully.`,
      });

      setReason('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update email verification',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Verification Override
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">User</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">
              <div className="font-medium">{user.full_name || user.email}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Current Status</Label>
            <div className="mt-1">
              <Badge variant={isVerified ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                {isVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Override *
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for this email verification override..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {isVerified ? (
              <Button
                variant="destructive"
                onClick={() => handleSubmit('unverify')}
                disabled={loading || !reason.trim()}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Mark as Unverified'}
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit('verify')}
                disabled={loading || !reason.trim()}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Mark as Verified'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}