import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  method: 'email' | 'sms' | 'whatsapp';
  phoneNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, method, phoneNumber }: PasswordResetRequest = await req.json();
    console.log(`Password reset requested for ${email} via ${method}`);

    // Generate reset token and expiry
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user profile with reset token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
      })
      .eq('email', email);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to generate reset token');
    }

    const resetUrl = `${req.headers.get('origin')}/reset-password?token=${resetToken}`;

    switch (method) {
      case 'email':
        await sendEmailReset(email, resetUrl, resetToken);
        break;
      case 'sms':
        if (!phoneNumber) throw new Error('Phone number required for SMS');
        await sendSMSReset(phoneNumber, resetToken);
        break;
      case 'whatsapp':
        if (!phoneNumber) throw new Error('Phone number required for WhatsApp');
        await sendWhatsAppReset(phoneNumber, resetToken);
        break;
      default:
        throw new Error('Invalid notification method');
    }

    return new Response(
      JSON.stringify({ message: `Password reset ${method} sent successfully` }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in password reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendEmailReset(email: string, resetUrl: string, token: string) {
  await resend.emails.send({
    from: "Password Reset <noreply@resend.dev>",
    to: [email],
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use one of the following options:</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3>Option 1: Click the link below</h3>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3>Option 2: Use this reset code</h3>
          <p style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${token.split('-')[0].toUpperCase()}</p>
          <p style="color: #666; font-size: 14px;">Enter this code on the password reset page</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">This reset link will expire in 24 hours. If you didn't request this reset, please ignore this email.</p>
      </div>
    `,
  });
}

async function sendSMSReset(phoneNumber: string, token: string) {
  // In production, integrate with SMS service like Twilio
  console.log(`SMS would be sent to ${phoneNumber} with token: ${token.split('-')[0].toUpperCase()}`);
  
  // For demo purposes, we'll just log it
  // In a real implementation, you would integrate with Twilio or similar service
  /*
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
  
  if (twilioSid && twilioToken && twilioNumber) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: twilioNumber,
        Body: `Your password reset code is: ${token.split('-')[0].toUpperCase()}. Valid for 24 hours.`
      }),
    });
  }
  */
}

async function sendWhatsAppReset(phoneNumber: string, token: string) {
  // In production, integrate with WhatsApp Business API
  console.log(`WhatsApp would be sent to ${phoneNumber} with token: ${token.split('-')[0].toUpperCase()}`);
  
  // For demo purposes, we'll just log it
  // In a real implementation, you would integrate with WhatsApp Business API
}

serve(handler);