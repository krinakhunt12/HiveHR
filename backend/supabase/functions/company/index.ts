/**
 * Company Admin API — /functions/v1/company
 * 
 * Role: 'company_admin'
 * Features:
 * - Manage employees in their own company (CRUD)
 * - View company-specific reports/activity
 * - Manage company policies
 * - Review leave requests
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  forbidden,
} from "../_shared/auth.ts";

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", "company"].includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();

  // STRICT RBAC: Only Company Admin (or Super Admin for troubleshooting)
  if (ctx.role !== "company_admin" && ctx.role !== "admin") {
    return forbidden();
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;
  const companyId = ctx.companyId;

  if (!companyId) {
    return jsonResponse(400, { error: "Admin is not associated with any company" });
  }

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0]; // employees | leaves | policies | reports
  const resourceId = segments[1] || null;

  try {
    /* =========================================================================
       EMPLOYEE MANAGEMENT
       ========================================================================= */
    if (resource === "employees") {
      // GET /company/employees
      if (method === "GET" && !resourceId) {
        const { data, error } = await adminClient
          .from("employees")
          .select("*, departments(id, name)")
          .eq("company_id", companyId)
          .order("full_name");
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      // POST /company/employees (Create Employee)
      if (method === "POST" && !resourceId) {
        const body = await req.json();
        const { email, password, full_name, employee_code, designation } = body;

        // 1. Create Auth
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role: "employee", company_id: companyId },
          app_metadata: { role: "employee" }
        });
        if (createError) throw createError;

        // 2. Profile & Employee record... (Condensed for brevity, similar to previous logic)
        await adminClient.from("profiles").upsert({
          user_id: newUser.user.id,
          full_name,
          role: "employee",
          company_id: companyId,
        });

        const { data: emp, error: empError } = await adminClient.from("employees").insert({
          company_id: companyId,
          user_id: newUser.user.id,
          employee_code,
          full_name,
          designation,
          status: "active",
        }).select().single();

        if (empError) throw empError;
        return jsonResponse(201, { message: "Employee added", data: emp });
      }

      // PATCH /company/employees/:id
      if (method === "PATCH" && resourceId) {
        const body = await req.json();
        const { data, error } = await adminClient
            .from("employees")
            .update(body)
            .eq("id", resourceId)
            .eq("company_id", companyId)
            .select()
            .single();
        if (error) throw error;
        return jsonResponse(200, data);
      }
    }

    /* =========================================================================
       LEAVE REVIEWS
       ========================================================================= */
    if (resource === "leaves") {
      if (method === "GET") {
        const { data, error } = await adminClient
          .from("leave_requests")
          .select("*, employees!inner(full_name, company_id)")
          .eq("employees.company_id", companyId);
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      if (method === "PATCH" && resourceId) {
        const { status } = await req.json();
        const { data, error } = await adminClient
          .from("leave_requests")
          .update({ status, reviewed_by: ctx.userId, reviewed_at: new Date().toISOString() })
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse(200, data);
      }
    }

    /* =========================================================================
       POLICIES
       ========================================================================= */
    if (resource === "policies") {
      if (method === "GET") {
        const { data, error } = await adminClient
          .from("company_policies")
          .select("*")
          .eq("company_id", companyId);
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await adminClient
          .from("company_policies")
          .insert({ ...body, company_id: companyId, created_by: ctx.userId })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse(201, data);
      }
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});
