import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  logAction,
  badRequest,
  forbidden,
} from "../_shared/auth.ts";

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", "attendance"].includes(segments[0])
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
  const supabase = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();
  
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  try {
    /* =========================================================================
       GET /attendance -> List records
       ========================================================================= */
    if (method === "GET") {
      let query = supabase.from("attendance").select("*, employees(full_name)");

      if (ctx.role === "employee") {
        if (!ctx.employeeId) return badRequest("No employee record found");
        query = query.eq("employee_id", ctx.employeeId);
      } else if (ctx.role === "company_admin") {
        query = query.eq("company_id", ctx.companyId);
      } 
      // Super admin sees all

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    /* =========================================================================
       POST /attendance -> Mark attendance
       ========================================================================= */
    if (method === "POST") {
      const body = await req.json();
      
      // If employee, enforce own employee_id and company_id
      if (ctx.role === "employee") {
        if (!ctx.employeeId) return badRequest("No employee record found");
        body.employee_id = ctx.employeeId;
        body.company_id = ctx.companyId;
      }

      if (!body.employee_id || !body.company_id || !body.date) {
        return badRequest("Missing employee_id, company_id, or date");
      }

      const { data, error } = await supabase.from("attendance").insert(body).select().single();
      if (error) throw error;

      await logAction(supabase, ctx, "MARK_ATTENDANCE", "attendance", data.id, body);
      return jsonResponse(201, { data });
    }

    /* =========================================================================
       PATCH /attendance/:id -> Update record (Admin only)
       ========================================================================= */
    if (method === "PATCH") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return badRequest("Missing attendance id");

      if (ctx.role === "employee") return forbidden();

      const body = await req.json();
      
      // Verification for company_admin
      if (ctx.role === "company_admin") {
         const { data: existing } = await supabase.from("attendance").select("company_id").eq("id", resourceId).single();
         if (!existing || existing.company_id !== ctx.companyId) return forbidden();
      }

      const { data, error } = await supabase.from("attendance").update(body).eq("id", resourceId).select().single();
      if (error) throw error;

      await logAction(supabase, ctx, "UPDATE_ATTENDANCE", "attendance", resourceId, body);
      return jsonResponse(200, { data });
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});
