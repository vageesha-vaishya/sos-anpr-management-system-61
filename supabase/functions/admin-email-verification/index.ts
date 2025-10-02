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

    // Update email verification status - set all required fields including email_change fields
    const now = new Date().toISOString();
    const updateData = action === 'verify' 
      ? { 
          email_confirmed_at: now,
          confirmed_at: now,
          // Also clear any pending email change to ensure no conflicts
          email_change: '',
          email_change_token_new: '',
          email_change_token_current: ''
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
        JSON.stringify({ error: 'Failed to update email verification status', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the update was successful by fetching the updated user
    const { data: updatedUser, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (verifyError) {
      console.error('Error verifying email update:', verifyError);
    } else {
      console.log('Verification confirmed - updated user email_confirmed_at:', updatedUser.user.email_confirmed_at);
      console.log('Verification confirmed - updated user confirmed_at:', updatedUser.user.confirmed_at);
    }

    // Also update the profiles table to keep it in sync
    const profileUpdateData = action === 'verify' 
      ? { 
          email_confirmed_at: now,
          confirmed_at: now,
          updated_at: now
        }
      : { 
          email_confirmed_at: null,
          confirmed_at: null,
          updated_at: now
        };

    console.log(`Updating profiles table for user ${userId} with data:`, profileUpdateData);

    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Error updating profiles table:', profileUpdateError);
      // Continue execution - don't fail the entire operation if profiles update fails
      // The trigger should handle this sync automatically anyway
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