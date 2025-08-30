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

interface TwoFactorRequest {
  action: 'send' | 'verify';
  userId: string;
  method: 'email' | 'sms' | 'whatsapp';
  code?: string;
  phoneNumber?: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, method, code, phoneNumber, email }: TwoFactorRequest = await req.json();
    console.log(`2FA ${action} requested for user ${userId} via ${method}`);

    if (action === 'send') {
      return await handleSend2FA(userId, method, phoneNumber, email);
    } else if (action === 'verify') {
      return await handleVerify2FA(userId, code!);
    } else {
      throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error("Error in 2FA handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function handleSend2FA(userId: string, method: string, phoneNumber?: string, email?: string) {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store code in user session
  const sessionToken = crypto.randomUUID();
  const { error: sessionError } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      two_factor_verified: false,
      expires_at: expiresAt.toISOString(),
      ip_address: '0.0.0.0', // In production, get real IP
      user_agent: 'Web App'
    });

  if (sessionError) {
    console.error('Error creating session:', sessionError);
    throw new Error('Failed to create verification session');
  }

  // Store the code temporarily (in production, use Redis or similar)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      two_factor_secret: code, // Temporarily store code here
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error storing 2FA code:', updateError);
    throw new Error('Failed to store verification code');
  }

  switch (method) {
    case 'email':
      if (!email) throw new Error('Email required');
      await send2FAEmail(email, code);
      break;
    case 'sms':
      if (!phoneNumber) throw new Error('Phone number required');
      await send2FASMS(phoneNumber, code);
      break;
    case 'whatsapp':
      if (!phoneNumber) throw new Error('Phone number required');
      await send2FAWhatsApp(phoneNumber, code);
      break;
  }

  return new Response(
    JSON.stringify({ 
      message: `2FA code sent via ${method}`,
      sessionToken 
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function handleVerify2FA(userId: string, code: string) {
  // Get stored code
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('two_factor_secret')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User not found');
  }

  if (profile.two_factor_secret !== code) {
    return new Response(
      JSON.stringify({ error: 'Invalid verification code' }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Mark session as verified and clear the code
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      two_factor_secret: null, // Clear the temporary code
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error clearing 2FA code:', updateError);
  }

  return new Response(
    JSON.stringify({ 
      message: '2FA verification successful',
      verified: true 
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function send2FAEmail(email: string, code: string) {
  await resend.emails.send({
    from: "Two-Factor Authentication <noreply@resend.dev>",
    to: [email],
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your two-factor authentication code is:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
    `,
  });
}

async function send2FASMS(phoneNumber: string, code: string) {
  console.log(`SMS 2FA code would be sent to ${phoneNumber}: ${code}`);
  // Implement SMS sending logic here
}

async function send2FAWhatsApp(phoneNumber: string, code: string) {
  console.log(`WhatsApp 2FA code would be sent to ${phoneNumber}: ${code}`);
  // Implement WhatsApp sending logic here
}

serve(handler);