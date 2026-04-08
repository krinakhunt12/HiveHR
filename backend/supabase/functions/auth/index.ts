import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (segments[0] === "functions" && segments[1] === "v1") segments.splice(0, 2);
  if (segments[0] === "auth") segments.shift();
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);

  try {
    const payload = await req.json().catch(() => ({}));

    // --- SIGNUP ---
    if (req.method === "POST" && path === "/signup") {
      const { email, password, full_name, role, company_name, company_id } = payload;
      let finalCompanyId = company_id;

      if (role === 'company_admin' && !finalCompanyId && company_name) {
           const { data: comp, error: compErr } = await adminClient.from("companies").insert({ name: company_name }).select().single();
           if (compErr) throw compErr;
           finalCompanyId = comp.id;
      }

      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, company_id: finalCompanyId }
      });
      if (authError || !authData.user) throw authError;

      await adminClient.from("profiles").insert({
        id: authData.user.id,
        full_name,
        role,
        email,
        company_id: finalCompanyId
      });

      return jsonResponse(201, { message: "Signup Successful", user_id: authData.user.id, redirect_to: "/login" });
    }

    // --- LOGIN (Now fetches company_name) ---
    if (req.method === "POST" && path === "/login") {
      const { email, password } = payload;
      const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({ email, password });
      if (loginError || !loginData.user || !loginData.session) throw loginError;

      const userId = loginData.user.id;
      
      // Fetch Profile AND Company Name in one go!
      const { data: profile, error: profErr } = await adminClient
          .from("profiles")
          .select(`
            *,
            companies (name)
          `)
          .eq("id", userId)
          .single();
      
      const companyName = (profile as any)?.companies?.name || null;
      
      // Update metadata to persist role/company in JWT
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { 
            ...loginData.user.user_metadata,
            role: profile.role,
            company_id: profile.company_id,
            company_name: companyName
        }
      });

      return jsonResponse(200, {
        message: "Login successful",
        user: { 
          id: userId, 
          email, 
          full_name: profile?.full_name || "User", 
          role: profile?.role || "employee",
          company_id: profile?.company_id || null,
          company_name: companyName
        },
        session: { 
          access_token: loginData.session.access_token, 
          refresh_token: loginData.session.refresh_token, 
          expires_at: loginData.session.expires_at 
        },
        redirect_to: profile?.role === "company_admin" ? "/dashboard/company" : "/dashboard/employee"
      });
    }

    return jsonResponse(404, { error: "Path not found" });
  } catch (error: any) {
    return jsonResponse(400, { error: error.message });
  }
});
