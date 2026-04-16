/**
 * Auth Edge Function — /functions/v1/auth
 *
 * POST /signup  — register a new company_admin (creates company) or employee
 * POST /login   — authenticate and return session + user info
 *
 * verify_jwt = false (public endpoint)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Strip leading /functions/v1/auth prefix from the pathname */
function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  // Remove "functions", "v1", and the function name "auth"
  while (
    segments.length > 0 &&
    ["functions", "v1", "auth"].includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);

  try {
    const payload = await req.json().catch(() => ({}));

    /* ─────────────────────────── SIGNUP ─────────────────────────── */
    if (req.method === "POST" && path === "/signup") {
      const { email, password, full_name, role, company_name, company_id } =
        payload as {
          email: string;
          password: string;
          full_name: string;
          role: "company_admin" | "employee";
          company_name?: string;
          company_id?: string;
        };

      const validationErrors: string[] = [];
      if (!email) validationErrors.push("Email is required");
      if (!password) validationErrors.push("Password is required");
      else if (password.length < 6) validationErrors.push("Password must be at least 6 characters");
      if (!full_name) validationErrors.push("Full name is required");
      if (!role) validationErrors.push("Role is required");
      
      if (role === "company_admin" && !company_id && !company_name) {
        validationErrors.push("Company name is required for company registration");
      }

      if (validationErrors.length > 0) {
        return jsonRes(400, { 
          message: "Validation failed", 
          errors: validationErrors,
          error: validationErrors[0] // Fallback for single-error handlers
        });
      }

      let finalCompanyId = company_id ?? null;

      // Auto-create company when registering as company_admin
      if (role === "company_admin" && !finalCompanyId && company_name) {
        const { data: comp, error: compErr } = await adminClient
          .from("companies")
          .insert({ name: company_name })
          .select()
          .single();
        if (compErr) throw compErr;
        finalCompanyId = comp.id;

        // Seed default leave policies (12 paid + 6 sick = 18 total)
        await adminClient.from("leave_configurations").insert([
          { company_id: finalCompanyId, leave_type: 'paid', annual_allowance: 12 },
          { company_id: finalCompanyId, leave_type: 'sick', annual_allowance: 6 }
        ]);
      }
      
      // ... (rest of signup logic)
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role, company_id: finalCompanyId },
          app_metadata: { role },
        });
      if (authError || !authData.user) {
        return jsonRes(400, { error: authError?.message ?? "Auth creation failed" });
      }

      const userId = authData.user.id;
      
      // ... (rest of signup logic continues)
      // (Abbreviated for brevity in this replacement chunk, but I'll ensure it stays consistent)
      // Actually I should probably provide the full block to be safe.
      
      // Upsert profile
      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            full_name,
            role,
            company_id: finalCompanyId,
          },
          { onConflict: "user_id" }
        );
      if (profileError) throw profileError;

      if (finalCompanyId) {
        await adminClient.from("company_memberships").upsert(
          {
            company_id: finalCompanyId,
            user_id: userId,
            role,
          },
          { onConflict: "company_id,user_id" }
        );
      }

      await adminClient.from("auth_activity_logs").insert({
        user_id: userId,
        email,
        action: "signup",
        role,
        status: "success",
        metadata: { company_id: finalCompanyId },
      });

      return jsonRes(201, {
        message: "Signup successful",
        user_id: userId,
        company_id: finalCompanyId,
        redirect_to: "/login",
      });
    }

    /* ─────────────────────────── LOGIN ──────────────────────────── */
    if (req.method === "POST" && path === "/login") {
      const { email, password, role: requestedRole } = payload as {
        email: string;
        password: string;
        role?: string;
      };

      const validationErrors: string[] = [];
      if (!email) validationErrors.push("Work email is required");
      if (!password) validationErrors.push("Password is required");

      if (validationErrors.length > 0) {
        return jsonRes(400, { 
          message: "Validation failed", 
          errors: validationErrors,
          error: validationErrors[0]
        });
      }

      const { data: loginData, error: loginError } =
        await publicClient.auth.signInWithPassword({ email, password });

      if (loginError || !loginData.user || !loginData.session) {
        // Log failed attempt
        await adminClient.from("auth_activity_logs").insert({
          email,
          action: "login",
          status: "failed",
          error_message: loginError?.message ?? "Unknown error",
          metadata: { requested_role: requestedRole },
        });
        
        let errorMsg = loginError?.message ?? "Login failed";
        if (errorMsg === "Invalid login credentials") {
          errorMsg = "The email or password you entered is incorrect.";
        }
        
        return jsonRes(401, { error: errorMsg, message: errorMsg });
      }

      const userId = loginData.user.id;

      // Fetch profile + company name in one join
      const { data: profile, error: profErr } = await adminClient
        .from("profiles")
        .select("*, companies(id, name)")
        .eq("user_id", userId)
        .single();

      if (profErr) throw profErr;

      // ROLE VERIFICATION: Ensure the user actually has the role they selected to login as
      if (requestedRole && profile.role !== requestedRole) {
        // Log unauthorized role attempt
        await adminClient.from("auth_activity_logs").insert({
          user_id: userId,
          email,
          action: "login",
          status: "denied",
          error_message: `Role mismatch: Requested ${requestedRole}, Actual ${profile.role}`,
          metadata: { requested_role: requestedRole, actual_role: profile.role },
        });

        // Sign out since sessions are created by signInWithPassword even if we reject it here
        await publicClient.auth.signOut();
        
        return jsonRes(403, { 
          error: `Access Denied: Your account does not have ${requestedRole} permissions.`,
          message: `Access Denied: Your account does not have ${requestedRole} permissions.`
        });
      }

      const companyName = (profile as any)?.companies?.name ?? null;
      const companyId = profile?.company_id ?? null;

      // Persist role + company into JWT metadata for downstream use
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...loginData.user.user_metadata,
          role: profile.role,
          company_id: companyId,
          company_name: companyName,
        },
        app_metadata: { role: profile.role },
      });

      // Log success
      await adminClient.from("auth_activity_logs").insert({
        user_id: userId,
        email,
        action: "login",
        role: profile.role,
        status: "success",
        metadata: { company_id: companyId },
      });

      const roleRedirects: Record<string, string> = {
        admin: "/dashboard/admin",
        company_admin: "/dashboard/company",
        employee: "/dashboard/employee",
      };

      return jsonRes(200, {
        message: "Login successful",
        user: {
          id: userId,
          email,
          full_name: profile?.full_name ?? "User",
          role: profile?.role ?? "employee",
          company_id: companyId,
          company_name: companyName,
          force_password_reset: loginData.user.user_metadata?.force_password_reset === true,
        },
        session: {
          access_token: loginData.session.access_token,
          refresh_token: loginData.session.refresh_token,
          expires_at: loginData.session.expires_at,
        },
        redirect_to: roleRedirects[profile?.role] ?? "/dashboard/employee",
      });
    }

    /* ──────────────────────── UPDATE PASSWORD ───────────────────── */
    if (req.method === "POST" && path === "/update-password") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return jsonRes(401, { error: "Missing authorization" });
      
      const { new_password } = payload as { new_password: string };
      if (!new_password || new_password.length < 6) {
        return jsonRes(400, { error: "New password must be at least 6 characters" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await publicClient.auth.getUser(token);
      
      if (userError || !user) {
        return jsonRes(401, { error: "Unauthorized or invalid session" });
      }

      // Update password and clear the reset flag
      const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
        password: new_password,
        user_metadata: {
          ...user.user_metadata,
          force_password_reset: false
        }
      });

      if (updateError) throw updateError;

      return jsonRes(200, { message: "Password updated successfully" });
    }

    return jsonRes(404, { error: `Path not found: ${path}` });
  } catch (err: any) {
    return jsonRes(400, { error: err.message ?? "Unexpected error" });
  }
});
