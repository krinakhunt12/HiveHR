import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  logAction,
} from "../_shared/auth.ts";

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { error: "Unauthorized" });
  
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  try {
    /* =========================================================================
       GET /attendance -> List records
       ========================================================================= */
    if (method === "GET") {
      let query = adminClient.from("attendance").select("*, employees(full_name)");

      if (ctx.role === "employee") {
        if (!ctx.employeeId) return jsonRes(400, { error: "No employee record found" });
        query = query.eq("employee_id", ctx.employeeId);
      } else if (ctx.role === "company_admin") {
        query = query.eq("company_id", ctx.companyId);
      } 
      // Super admin sees all

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return jsonRes(200, { data });
    }

    /* =========================================================================
       POST /attendance -> Mark attendance (Punch In)
       ========================================================================= */
    if (method === "POST") {
      const body = await req.json();
      const today = new Date().toISOString().slice(0, 10);
      
      // If employee, enforce own employee_id and company_id
      if (ctx.role === "employee") {
        if (!ctx.employeeId) return jsonRes(400, { error: "No employee record found" });
        body.employee_id = ctx.employeeId;
        body.company_id = ctx.companyId;
      }

      body.date = body.date || today;
      body.status = body.status || "present";
      body.check_in_at = new Date().toISOString();

      if (!body.employee_id || !body.company_id) {
        return jsonRes(400, { error: "Missing employee_id or company_id" });
      }

      // Check if already checked in for today
      const { data: existing } = await adminClient.from("attendance")
        .select("id")
        .eq("employee_id", body.employee_id)
        .eq("date", body.date)
        .single();

      if (existing) {
        return jsonRes(200, { data: existing, message: "Already checked in" });
      }

      const { data, error } = await adminClient.from("attendance").insert(body).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "MARK_ATTENDANCE", "attendance", data.id, body);
      return jsonRes(201, { data });
    }

    /* =========================================================================
       PATCH /attendance/:id -> Update record (Punch Out or Admin Edit)
       ========================================================================= */
    if (method === "PATCH") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return jsonRes(400, { error: "Missing attendance id" });

      const body = await req.json();

      // If employee IS punching out, we allow it
      if (ctx.role === "employee") {
        // Enforce safety: Employee can only update their own record and only the check_out_at field (usually)
        const { data: existing } = await adminClient.from("attendance").select("employee_id, company_id, check_in_at, break_minutes").eq("id", resourceId).single();
        if (!existing || existing.employee_id !== ctx.employeeId) return jsonRes(403, { error: "Forbidden" });
        
        // Auto-set check_out_at if not provided in body (standard punch out)
        if (!body.check_out_at) body.check_out_at = new Date().toISOString();
        
        // Calculate work minutes logic (8h work + variable break)
        if (existing.check_in_at) {
          const start = new Date(existing.check_in_at).getTime();
          const end = new Date(body.check_out_at).getTime();
          const totalMinutes = Math.round((end - start) / (1000 * 60));
          
          // Use provided break_minutes or existing or default to 60
          const breakMin = body.break_minutes ?? existing.break_minutes ?? 60;
          
          // Work Minutes = Total Stay - Break Time
          body.work_minutes = totalMinutes - breakMin;
          
          // Optional: Auto-adjust status if below 8 hours
          if (body.work_minutes < 480) {
            body.status = "short_shift"; // or keep as is if admin handles it
          } else {
            body.status = "present";
          }
        }
      } else if (ctx.role === "company_admin") {
         const { data: existing } = await adminClient.from("attendance").select("company_id").eq("id", resourceId).single();
         if (!existing || existing.company_id !== ctx.companyId) return jsonRes(403, { error: "Forbidden" });
      }

      const { data, error } = await adminClient.from("attendance").update(body).eq("id", resourceId).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "UPDATE_ATTENDANCE", "attendance", resourceId, body);
      return jsonRes(200, { data });
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    console.error("[attendance] Error:", err);
    return jsonRes(400, { error: err.message });
  }
});
