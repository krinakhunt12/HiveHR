/**
 * /functions/v1/auth
 *
 * POST /signup           — register company_admin (creates company) or employee
 * POST /login            — authenticate → session + user info
 * POST /update-password  — change own password (bearer required)
 *
 * verify_jwt = false  (public endpoint; auth is done inside the function)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import {
  jsonRes,
  successRes,
  createdRes,
  errorRes,
  normalizePath,
  handleOptions,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  try {

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const publicClient = createClient(supabaseUrl, anonKey);
    const svcClient = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "auth");
    const method = req.method;

    const payload = await req.json().catch(() => ({}));


    // ═══════════════════════════════════════════════════════
    // POST /signup
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && path === "/signup") {
      const {
        email,
        password,
        full_name,
        role,
        company_name,
        company_id,
      } = payload as {
        email: string;
        password: string;
        full_name: string;
        role: "company_admin" | "employee";
        company_name?: string;
        company_id?: string;
      };

      const errors: string[] = [];
      if (!email) errors.push("Email is required");
      if (!password) errors.push("Password is required");
      else if (password.length < 8)
        errors.push("Password must be at least 8 characters");
      if (!full_name) errors.push("Full name is required");
      if (!role || !["company_admin", "employee"].includes(role))
        errors.push("Role must be company_admin or employee");
      if (role === "company_admin" && !company_id && !company_name)
        errors.push("company_name is required when registering as company_admin");

      if (errors.length > 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: errors[0], errors });

      let finalCompanyId = company_id ?? null;

      // Auto-create company for new company_admin registrations
      if (role === "company_admin" && !finalCompanyId && company_name) {
        // Find the Starter plan
        const { data: starterPlan } = await svcClient
          .from("plans")
          .select("id")
          .eq("name", "Starter")
          .single();

        const { data: comp, error: compErr } = await svcClient
          .from("companies")
          .insert({
            name: company_name,
            email: email,
            plan_id: starterPlan?.id ?? null,
            plan_status: "active",
            plan_start_date: new Date().toISOString().slice(0, 10),
            plan_end_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString().slice(0, 10),
          })
          .select()
          .single();

        if (compErr) throw compErr;
        finalCompanyId = comp.id;

        // Seed default leave types
        await svcClient.from("leave_types").insert([
          { company_id: finalCompanyId, name: "Casual Leave", is_paid: true, annual_quota: 12 },
          { company_id: finalCompanyId, name: "Sick Leave", is_paid: true, annual_quota: 10 },
          { company_id: finalCompanyId, name: "Unpaid Leave", is_paid: false, annual_quota: 999 },
        ]);

        // Seed default work policy
        await svcClient.from("work_policies").insert({
          company_id: finalCompanyId,
          policy_name: "Standard Office Policy",
          shift_start: "09:00",
          shift_end: "18:00",
          total_hours_required: 9,
          break_duration_minutes: 60,
          net_work_hours_required: 8,
          grace_period_minutes: 15,
          overtime_threshold_minutes: 480,
          half_day_threshold_hours: 4,
          applicable_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          is_default: true,
          is_flexible: false,
        });
      }

      // Create Auth user
      const { data: authData, error: authError } =
        await svcClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role, company_id: finalCompanyId },
          app_metadata: { role },
        });

      if (authError || !authData.user)
        return jsonRes(400, {
          success: false,
          code: "AUTH_ERROR",
          message: authError?.message ?? "User creation failed",
        });

      const userId = authData.user.id;

      // Upsert profile
      const { error: profileErr } = await svcClient.from("profiles").upsert(
        { user_id: userId, full_name, role, company_id: finalCompanyId },
        { onConflict: "user_id" }
      );
      if (profileErr) throw profileErr;

      // Create company membership
      if (finalCompanyId) {
        await svcClient.from("company_memberships").upsert(
          { company_id: finalCompanyId, user_id: userId, role },
          { onConflict: "company_id,user_id" }
        );
      }

      // Audit log
      await svcClient.from("auth_activity_logs").insert({
        user_id: userId,
        email,
        action: "signup",
        role,
        status: "success",
        metadata: { company_id: finalCompanyId },
      });

      return createdRes("Signup successful", {
        user_id: userId,
        company_id: finalCompanyId,
        redirect_to: "/login",
      });
    }

    // ═══════════════════════════════════════════════════════
    // POST /login
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && path === "/login") {
      const { email, password, role: requestedRole } = payload as {
        email: string;
        password: string;
        role?: string;
      };

      const errors: string[] = [];
      if (!email) errors.push("Email is required");
      if (!password) errors.push("Password is required");
      if (errors.length > 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: errors[0], errors });

      const { data: loginData, error: loginError } =
        await publicClient.auth.signInWithPassword({ email, password });

      if (loginError || !loginData?.user || !loginData?.session) {
        await svcClient.from("auth_activity_logs").insert({
          email,
          action: "login",
          status: "failed",
          error_message: loginError?.message ?? "Unknown",
          metadata: { requested_role: requestedRole },
        });
        const msg =
          loginError?.message === "Invalid login credentials"
            ? "The email or password you entered is incorrect."
            : loginError?.message ?? "Login failed";
        return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: msg });
      }

      const userId = loginData.user.id;

      const { data: profile, error: profErr } = await svcClient
        .from("profiles")
        .select("*, companies(id, name)")
        .eq("user_id", userId)
        .single();

      if (profErr || !profile) throw profErr ?? new Error("Profile not found");

      // Role verification — if the login form specified a role, validate it
      if (requestedRole && profile.role !== requestedRole) {
        await svcClient.from("auth_activity_logs").insert({
          user_id: userId,
          email,
          action: "login",
          status: "denied",
          error_message: `Role mismatch: requested ${requestedRole}, actual ${profile.role}`,
          metadata: { requested_role: requestedRole, actual_role: profile.role },
        });
        await publicClient.auth.signOut();
        return jsonRes(403, {
          success: false,
          code: "FORBIDDEN",
          message: `Access denied: Your account does not have ${requestedRole} permissions.`,
        });
      }

      const companyName = (profile as Record<string, unknown> & { companies?: { name: string } })?.companies?.name ?? null;
      const companyId = profile.company_id ?? null;

      // Sync role into JWT metadata
      await svcClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...loginData.user.user_metadata,
          role: profile.role,
          company_id: companyId,
          company_name: companyName,
        },
        app_metadata: { role: profile.role },
      });

      await svcClient.from("auth_activity_logs").insert({
        user_id: userId,
        email,
        action: "login",
        role: profile.role,
        status: "success",
        metadata: { company_id: companyId },
      });

      const redirectMap: Record<string, string> = {
        super_admin: "/dashboard/super-admin",
        company_admin: "/dashboard/company",
        employee: "/dashboard/employee",
      };

      return successRes("Login successful", {
        user: {
          id: userId,
          email,
          full_name: profile.full_name ?? "",
          role: profile.role,
          company_id: companyId,
          company_name: companyName,
          force_password_reset:
            loginData.user.user_metadata?.force_password_reset === true,
        },
        session: {
          access_token: loginData.session.access_token,
          refresh_token: loginData.session.refresh_token,
          expires_at: loginData.session.expires_at,
        },
        redirect_to: redirectMap[profile.role] ?? "/dashboard/employee",
      });
    }

    // ═══════════════════════════════════════════════════════
    // POST /update-password
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && path === "/update-password") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader)
        return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Missing authorization header" });

      const { new_password } = payload as { new_password: string };
      if (!new_password || new_password.length < 8)
        return jsonRes(400, {
          success: false,
          code: "VALIDATION_ERROR",
          message: "New password must be at least 8 characters",
        });

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userErr } = await publicClient.auth.getUser(token);
      if (userErr || !user)
        return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Invalid session" });

      const { error: updateErr } = await svcClient.auth.admin.updateUserById(user.id, {
        password: new_password,
        user_metadata: { 
          ...user.user_metadata, 
          force_password_reset: false,
          is_first_login: false 
        },
      });
      if (updateErr) throw updateErr;

      // Also update the profiles table so fresh fetches see the change
      await svcClient
        .from("profiles")
        .update({ is_first_login: false })
        .eq("user_id", user.id);

      // ─────────────────────────────────────────────────────────────
      // IMPORTANT: Password change often invalidates the current session.
      // We re-sign in to get a fresh session and return it to the client.
      // ─────────────────────────────────────────────────────────────
      const { data: authData, error: authErr } = await publicClient.auth.signInWithPassword({
        email: user.email!,
        password: new_password,
      });

      if (authErr) {
        // If re-auth fails (unlikely), we still succeeded in changing the password
        return successRes("Password updated, please log in again.");
      }

      return successRes("Password updated successfully", {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "User",
          role: user.app_metadata?.role || "employee",
          company_id: user.user_metadata?.company_id || null,
          force_password_reset: false,
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      });
    }

    // ═══════════════════════════════════════════════════════
    // POST /logout
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && path === "/logout") {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await publicClient.auth.getUser(token);
        if (user) {
          await svcClient.from("auth_activity_logs").insert({
            user_id: user.id,
            email: user.email,
            action: "logout",
            status: "success",
          });
        }
      }
      await publicClient.auth.signOut();
      return successRes("Logged out successfully");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: `Path not found: ${path}` });

  } catch (err: unknown) {
    return errorRes(err, "auth");
  }
});
