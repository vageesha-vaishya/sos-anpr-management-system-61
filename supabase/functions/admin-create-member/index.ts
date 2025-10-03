import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://oimlpoizcfywxaahliij.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FamilyMember {
  full_name: string;
  relationship: string;
  age?: number | null;
  phone_number?: string | null;
  email?: string | null;
  is_emergency_contact?: boolean;
}

interface CreateMemberRequest {
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  unit_id?: string;
  assignment_type?: 'owner' | 'tenant' | 'family_member';
  family_members?: FamilyMember[];
}

function generateTempPassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let pwd = '';
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const token = authHeader.replace('Bearer ', '');

    // Validate caller session
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !adminUser) throw new Error('Invalid authentication');

    // Verify admin role
    const { data: adminProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', adminUser.id)
      .single();
    if (profileErr || !adminProfile) throw new Error('Admin profile not found');

    const adminRoles = ['platform_admin', 'franchise_admin', 'customer_admin', 'society_president', 'society_secretary'];
    if (!adminRoles.includes(adminProfile.role)) throw new Error('Insufficient permissions');

    const payload: CreateMemberRequest = await req.json();
    const { email, full_name, phone, role, status, unit_id, assignment_type, family_members } = payload;

    if (!email || !full_name || !role || !status) throw new Error('Missing required fields');

    // Resolve organization_id: prefer unit->building->location org, else admin org
    let targetOrgId: string | null = adminProfile.organization_id;
    if (unit_id) {
      const { data: unitRow, error: unitErr } = await supabase
        .from('society_units')
        .select('id, buildings:buildings(locations:locations(organization_id))')
        .eq('id', unit_id)
        .maybeSingle();
      if (unitErr) throw unitErr;
      const orgId = (unitRow as any)?.buildings?.locations?.organization_id;
      if (orgId) targetOrgId = orgId;
    }

    if (!targetOrgId) throw new Error('Unable to determine organization for member');

    // Create or reuse auth user (idempotent)
    const normalizedEmail = email.trim().toLowerCase();
    const tempPassword = generateTempPassword();

    let newUserId: string | null = null;

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: false,
      user_metadata: { full_name, phone, requires_password_change: true }
    });

    if (createErr || !created?.user) {
      // If the email already exists, find that user and continue
      const isEmailExists = (createErr?.message || '').toLowerCase().includes('already been registered')
        || (createErr as any)?.status === 422
        || (createErr as any)?.code === 'email_exists';

      if (!isEmailExists) throw new Error(createErr?.message || 'Failed to create user');

      // Search existing users by email via pagination
      let page = 1;
      const perPage = 200;
      let found = null as any;
      while (!found) {
        const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
        if (listErr) throw listErr;
        found = list.users.find((u: any) => (u.email || '').toLowerCase() === normalizedEmail);
        if (found || list.users.length < perPage) break;
        page += 1;
      }

      if (!found) throw new Error('User with this email exists but could not be located');
      newUserId = found.id;
    } else {
      newUserId = created.user.id;
    }

    // Upsert profile to ensure correct role/status/org/phone
    const { error: profUpdErr } = await supabase
      .from('profiles')
      .upsert({ id: newUserId, email: normalizedEmail, role, status, organization_id: targetOrgId, phone, full_name }, { onConflict: 'id' });
    if (profUpdErr) throw profUpdErr;

    // Unit assignment
    if (unit_id && assignment_type) {
      const { error: uaErr } = await supabase
        .from('unit_assignments')
        .insert({ unit_id, resident_id: newUserId, assignment_type, is_primary: true, organization_id: targetOrgId });
      if (uaErr) throw uaErr;

      // Update unit occupancy fields
      const { error: unitUpdateErr } = await supabase
        .from('society_units')
        .update({ is_occupied: true, primary_resident_id: newUserId })
        .eq('id', unit_id);
      if (unitUpdateErr) throw unitUpdateErr;
    }

    // Family members
    if (family_members && family_members.length > 0 && unit_id) {
      const fmRows = family_members.map((m) => ({
        unit_id,
        primary_resident_id: newUserId,
        full_name: m.full_name,
        relationship: m.relationship,
        age: m.age ?? null,
        phone_number: m.phone_number ?? null,
        email: m.email ?? null,
        is_emergency_contact: !!m.is_emergency_contact,
        organization_id: targetOrgId,
      }));
      const { error: fmErr } = await supabase.from('household_members').insert(fmRows);
      if (fmErr) throw fmErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('admin-create-member error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});