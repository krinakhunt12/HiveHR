/**
 * /functions/v1/profile
 *
 * GET    /           — get own profile (all roles)
 * PATCH  /           — update own profile (name, avatar, phone)
 * GET    /policy     — get own work policy (employee only)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  errorRes,
  normalizePath,
  corsHeaders,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const svcClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

  const url = new URL(req.url);
  const path = normalizePath(url.pathname, "profile");
  const method = req.method;
  const segments = path.replace(/^\//, "").split("/");
  const subPath = segments[0] || null;

  try {
    // ═══════════════════════════════════════════════════════
    // GET /policy — employee's assigned work policy
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && subPath === "policy") {
      if (!ctx.employeeId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });

      const { data: employee } = await svcClient
        .from("employees")
        .select("policy_id, department_id, company_id")
        .eq("id", ctx.employeeId)
        .single();

      let policyId = employee?.policy_id;

      // Fall back to department policy (not implemented at column level, skip)
      // Fall back to company default policy
      if (!policyId) {
        const { data: defaultPolicy } = await svcClient
          .from("work_policies")
          .select("id")
          .eq("company_id", employee?.company_id)
          .eq("is_default", true)
          .maybeSingle();
        policyId = defaultPolicy?.id ?? null;
      }

      if (!policyId)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "No work policy assigned" });

      const { data, error } = await svcClient
        .from("work_policies")
        .select("*")
        .eq("id", policyId)
        .single();
      if (error) throw error;
      return successRes("Work policy fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // GET / — own profile
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !subPath) {
      const { data: profile, error } = await svcClient
        .from("profiles")
        .select("*, companies(id, name, plan_id, plans(name))")
        .eq("user_id", ctx.userId)
        .single();
      if (error) throw error;

      // Include employee record if role is employee
      let employeeRecord = null;
      if (ctx.employeeId) {
        const { data: emp } = await svcClient
          .from("employees")
          .select("*, departments(name), designations(name), work_policies(policy_name, shift_start, shift_end)")
          .eq("id", ctx.employeeId)
          .single();
        employeeRecord = emp;
      }

      return successRes("Profile fetched", { ...profile, employee: employeeRecord });
    }

    // ═══════════════════════════════════════════════════════
    // PATCH / — update own profile
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && !subPath) {
      const body = await req.json();

      // Employees and company admins cannot change role or company_id via this endpoint
      if (ctx.role !== "super_admin") {
        delete body.role;
        delete body.company_id;
      }
      // Nobody can change user_id
      delete body.user_id;

      const { data, error } = await svcClient
        .from("profiles")
        .update(body)
        .eq("user_id", ctx.userId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "UPDATE_PROFILE", "profiles", ctx.userId, body);
      return successRes("Profile updated", data);
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "profile");
  }
});
