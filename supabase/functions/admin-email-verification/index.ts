import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://oimlpoizcfywxaahliij.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailVerificationRequest {
  userId: string;
  action: 'verify' | 'unverify';
  reason: string;
  notifyUser?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the admin user has permission
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin permissions by querying profiles directly
    const { data: adminProfile, error: permError } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();
    
    if (permError) {
      console.error('Error fetching admin profile:', permError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminProfile) {
      return new Response(
        JSON.stringify({ error: 'Admin profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has required role for managing user passwords/email verification
    const allowedRoles = ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president'];
    if (!allowedRoles.includes(adminProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, action, reason, notifyUser }: EmailVerificationRequest = await req.json();

    if (!userId || !action || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, action, reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['verify', 'unverify'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "verify" or "unverify"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user details
    const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update email verification status - set both required fields
    const now = new Date().toISOString();
    const updateData = action === 'verify' 
      ? { 
          email_confirmed_at: now,
          confirmed_at: now
        }
      : { 
          email_confirmed_at: null,
          confirmed_at: null
        };

    console.log(`Updating user ${userId} with data:`, updateData);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error('Error updating email verification:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update email verification status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action for audit trail
    const auditLog = {
      action_type: `email_${action}`,
      target_user_id: userId,
      target_user_email: targetUser.user.email,
      admin_user_id: user.id,
      admin_email: user.email,
      reason: reason,
      timestamp: new Date().toISOString(),
      metadata: {
        previous_status: targetUser.user.email_confirmed_at ? 'verified' : 'unverified',
        new_status: action === 'verify' ? 'verified' : 'unverified',
        notify_user: notifyUser || false
      }
    };

    console.log('Email verification audit log:', auditLog);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email ${action === 'verify' ? 'verified' : 'unverified'} successfully`,
        audit_log: auditLog
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in admin-email-verification function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);