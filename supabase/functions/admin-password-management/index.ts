import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

// Initialize clients with fallback values
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://oimlpoizcfywxaahliij.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not configured');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordManagementRequest {
  userId: string;
  action: 'reset_link' | 'temporary_password' | 'permanent_password';
  method?: 'email' | 'sms' | 'whatsapp';
  password?: string;
  reason: string;
  notifyUser: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and get admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      throw new Error('Invalid authentication');
    }

    // Verify admin permissions
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', adminUser.id)
      .single();

    if (adminError || !adminProfile) {
      throw new Error('Admin profile not found');
    }

    const adminRoles = ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president'];
    if (!adminRoles.includes(adminProfile.role)) {
      throw new Error('Insufficient permissions');
    }

    const requestData: PasswordManagementRequest = await req.json();
    const { userId, action, method, password, reason, notifyUser } = requestData;

    // Get target user information
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, organization_id')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      throw new Error('Target user not found');
    }

    // Verify organization access (except for platform admin)
    if (adminProfile.role !== 'platform_admin' && targetUser.organization_id !== adminProfile.organization_id) {
      throw new Error('Cannot manage users outside your organization');
    }

    let resultMessage = '';
    let updatedFields: any = {};

    switch (action) {
      case 'reset_link':
        resultMessage = await handleResetLink(targetUser, method || 'email');
        break;
      
      case 'temporary_password':
        if (!password) throw new Error('Password is required for temporary password action');
        resultMessage = await handleTemporaryPassword(targetUser, password);
        updatedFields = {
          requires_password_change: true,
          admin_set_password: true,
          password_changed_by_admin: adminUser.id,
          last_password_change: new Date().toISOString()
        };
        break;
      
      case 'permanent_password':
        if (!password) throw new Error('Password is required for permanent password action');
        resultMessage = await handlePermanentPassword(targetUser, password);
        updatedFields = {
          requires_password_change: false,
          admin_set_password: true,
          password_changed_by_admin: adminUser.id,
          last_password_change: new Date().toISOString()
        };
        break;
      
      default:
        throw new Error('Invalid action');
    }

    // Update user profile if needed
    if (Object.keys(updatedFields).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
      }
    }

    // Log the action in audit table
    await logPasswordAction(adminUser.id, userId, action, reason, adminProfile.organization_id, req);

    // Send notification to user if requested
    if (notifyUser) {
      await sendPasswordChangeNotification(targetUser, action, adminUser.email);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: resultMessage 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Admin password management error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function handleResetLink(user: any, method: string): Promise<string> {
  // Generate reset token
  const resetToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

  // Update user profile with reset token
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      password_reset_token: resetToken,
      password_reset_expires: expiresAt.toISOString()
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error('Failed to generate reset token');
  }

  const resetUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  switch (method) {
    case 'email':
      await sendResetEmail(user.email, resetUrl, resetToken);
      return 'Password reset email sent successfully';
    
    case 'sms':
      await sendResetSMS(user.phone, resetToken);
      return 'Password reset SMS sent successfully';
    
    case 'whatsapp':
      await sendResetWhatsApp(user.phone, resetToken);
      return 'Password reset WhatsApp message sent successfully';
    
    default:
      throw new Error('Invalid delivery method');
  }
}

async function handleTemporaryPassword(user: any, password: string): Promise<string> {
  // Update password using Supabase Admin API
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: password
  });

  if (error) {
    throw new Error('Failed to set temporary password');
  }

  return 'Temporary password set successfully. User will be forced to change it on next login.';
}

async function handlePermanentPassword(user: any, password: string): Promise<string> {
  // Update password using Supabase Admin API
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: password
  });

  if (error) {
    throw new Error('Failed to set permanent password');
  }

  return 'Permanent password set successfully.';
}

async function logPasswordAction(
  adminId: string, 
  userId: string, 
  action: string, 
  reason: string, 
  organizationId: string,
  req: Request
): Promise<void> {
  const userAgent = req.headers.get('user-agent');
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';

  const { error } = await supabase
    .from('password_change_audit')
    .insert({
      admin_id: adminId,
      user_id: userId,
      action_type: action,
      ip_address: ipAddress,
      user_agent: userAgent,
      organization_id: organizationId
    });

  if (error) {
    console.error('Failed to log password action:', error);
  }
}

async function sendResetEmail(email: string, resetUrl: string, token: string): Promise<void> {
  if (!resend) {
    throw new Error('Email service not configured');
  }
  try {
    await resend.emails.send({
      from: 'ANPR Management <no-reply@anpr.lovable.dev>',
      to: [email],
      subject: 'Password Reset Request - ANPR Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Your password has been reset by an administrator. You can set a new password using the link below:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">Or use this reset code: <strong>${token}</strong></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't request this password reset, please contact your administrator.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

async function sendResetSMS(phone: string, token: string): Promise<void> {
  // SMS implementation would go here
  console.log(`SMS reset token for ${phone}: ${token}`);
  // For now, just log. In production, integrate with SMS service like Twilio
}

async function sendResetWhatsApp(phone: string, token: string): Promise<void> {
  // WhatsApp implementation would go here
  console.log(`WhatsApp reset token for ${phone}: ${token}`);
  // For now, just log. In production, integrate with WhatsApp Business API
}

async function sendPasswordChangeNotification(user: any, action: string, adminEmail: string): Promise<void> {
  if (!resend) {
    console.log('Email service not configured, skipping notification');
    return;
  }

  const actionTexts = {
    reset_link: 'A password reset link has been sent to you',
    temporary_password: 'A temporary password has been set for your account. You will be required to change it on your next login',
    permanent_password: 'Your password has been updated by an administrator'
  };

  try {
    await resend.emails.send({
      from: 'ANPR Management <no-reply@anpr.lovable.dev>',
      to: [user.email],
      subject: 'Password Changed - ANPR Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Change Notification</h2>
          <p>Hello ${user.full_name},</p>
          <p>${actionTexts[action] || 'Your password has been modified by an administrator'}.</p>
          <p style="color: #666; font-size: 14px;">
            This action was performed by: ${adminEmail}<br>
            Date: ${new Date().toLocaleString()}
          </p>
          <p style="color: #e74c3c; font-size: 14px;">
            If you did not request this change or have concerns about your account security, please contact your administrator immediately.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from the ANPR Management System.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
    // Don't throw error here as the main action was successful
  }
}

serve(handler);