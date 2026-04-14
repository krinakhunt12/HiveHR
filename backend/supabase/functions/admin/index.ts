/**
 * Super Admin API — /functions/v1/admin
 * 
 * Role: 'admin'
 * Features:
 * - Manage all companies (CRUD)
 * - Manage all users/employees across the system
 * - Assign roles
 * - System-wide analytics
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
    ["functions", "v1", "admin"].includes(segments[0])
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

  // STRICT RBAC: Only Super Admin
  if (ctx.role !== "admin") {
    return forbidden();
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0]; // companies | users | employees | analytics
  const resourceId = segments[1] || null;

  try {
    /* =========================================================================
       COMPANIES MANAGEMENT
       ========================================================================= */
    if (resource === "companies") {
      // GET /admin/companies
      if (method === "GET") {
        const { data, error } = await adminClient
          .from("companies")
          .select("*")
          .order("name");
        if (error) throw error;
        return jsonResponse(200, { data });
      }
      
      // POST /admin/companies
      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await adminClient
          .from("companies")
          .insert(body)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse(201, { message: "Company created", data });
      }

      // PATCH /admin/companies/:id
      if (method === "PATCH" && resourceId) {
        const body = await req.json();
        const { data, error } = await adminClient
            .from("companies")
            .update(body)
            .eq("id", resourceId)
            .select()
            .single();
        if (error) throw error;
        return jsonResponse(200, { data });
      }
    }

    /* =========================================================================
       USER & ROLE MANAGEMENT
       ========================================================================= */
    if (resource === "users") {
      // GET /admin/users
      if (method === "GET") {
        const { data, error } = await adminClient
          .from("profiles")
          .select("*, companies(name)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      // POST /admin/users/assign-role
      if (method === "POST" && resourceId === "assign-role") {
        const { user_id, role } = await req.json();
        const { data, error } = await adminClient
          .from("profiles")
          .update({ role })
          .eq("user_id", user_id)
          .select()
          .single();
        if (error) throw error;
        
        // Also update Auth Metadata
        await adminClient.auth.admin.updateUserById(user_id, {
            user_metadata: { role },
            app_metadata: { role }
        });

        return jsonResponse(200, { message: "Role assigned successfully", data });
      }
    }

    /* =========================================================================
       SYSTEM-WIDE EMPLOYEES
       ========================================================================= */
    if (resource === "employees") {
      if (method === "GET") {
        const companyId = url.searchParams.get("company_id");
        let query = adminClient.from("employees").select("*, companies(name)");
        if (companyId) query = query.eq("company_id", companyId);
        
        const { data, error } = await query;
        if (error) throw error;
        return jsonResponse(200, { data });
      }
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});
