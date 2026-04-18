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
    ["functions", "v1", "leave"].includes(segments[0])
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
       GET /leave -> List records
       ========================================================================= */
    if (method === "GET") {
      let query = adminClient.from("leaves").select("*, employees(full_name, employee_code)");

      if (ctx.role === "employee") {
        if (!ctx.employeeId) return jsonRes(400, { error: "No employee record found" });
        query = query.eq("employee_id", ctx.employeeId);
      } else if (ctx.role === "company_admin") {
        query = query.eq("company_id", ctx.companyId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return jsonRes(200, { data });
    }

    /* =========================================================================
       POST /leave -> Apply for leave
       ========================================================================= */
    if (method === "POST") {
      const body = await req.json();
      
      if (ctx.role === "employee") {
        if (!ctx.employeeId) return jsonRes(400, { error: "No employee record found" });
        body.employee_id = ctx.employeeId;
        body.company_id = ctx.companyId;
        body.status = "pending";
      }

      if (!body.employee_id || !body.company_id || !body.dates) {
        return jsonRes(400, { error: "Missing employee_id, company_id, or dates" });
      }

      const { data, error } = await adminClient.from("leaves").insert(body).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "APPLY_LEAVE", "leaves", data.id, body);
      return jsonRes(201, { data });
    }

    /* =========================================================================
       PATCH /leave/:id -> Update status (Approve/Reject/Cancel)
       ========================================================================= */
    if (method === "PATCH") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return jsonRes(400, { error: "Missing leave id" });

      const body = await req.json();
      const { status } = body;

      // Verification
      const { data: existing } = await adminClient.from("leaves").select("*").eq("id", resourceId).single();
      if (!existing) return jsonRes(404, { error: "Leave request not found" });

      if (ctx.role === "employee") {
        // Employees can only cancel their own pending leaves
        if (existing.employee_id !== ctx.employeeId) return jsonRes(403, { error: "Forbidden" });
        if (status !== "cancelled") return jsonRes(400, { error: "Employees can only cancel leave" });
        if (existing.status !== "pending") return jsonRes(400, { error: "Cannot cancel leave that is already reviewed" });
      } else if (ctx.role === "company_admin") {
        if (existing.company_id !== ctx.companyId) return jsonRes(403, { error: "Forbidden" });
      }

      const { data, error } = await adminClient.from("leaves").update({ status }).eq("id", resourceId).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "REVIEW_LEAVE", "leaves", resourceId, { status });
      return jsonRes(200, { data });
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    return jsonRes(400, { error: err.message });
  }
});
