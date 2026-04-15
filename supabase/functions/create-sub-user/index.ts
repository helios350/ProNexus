import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
         throw new Error("Forbidden: Not an admin or teacher.");
    }

    const { email, password, role, firstName, lastName, batchId, rollNo, contact } = await req.json();

    if (profile.role === 'teacher' && role === 'admin') {
      throw new Error("Forbidden: Teachers cannot create Admin roles.");
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, first_name: firstName, last_name: lastName, batch_id: batchId, needs_password_reset: true, roll_no: rollNo, contact: contact }
    });

    if (createError) throw createError;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        role: role,
        full_name: `${firstName} ${lastName}`.trim(),
        email: email,
        roll_no: rollNo || null,
        contact: contact || null,
        batch_id: batchId || null
      });

    if (profileError) {
      console.warn("Profile creation failed, trigger check: ", profileError.message);
    }

    return new Response(JSON.stringify({ user: newUser }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
