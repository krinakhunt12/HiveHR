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
    ["functions", "v1", "policies"].includes(segments[0])
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
       GET /policies -> List policies
       ========================================================================= */
    if (method === "GET") {
      let query = supabase.from("policies").select("*");

      if (ctx.role === "employee" || ctx.role === "company_admin") {
        if (!ctx.companyId) return badRequest("Context: No company ID found");
        query = query.eq("company_id", ctx.companyId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    /* =========================================================================
       POST /policies -> Create policy (Admin/CompanyAdmin only)
       ========================================================================= */
    if (method === "POST") {
      if (ctx.role === "employee") return forbidden();

      const body = await req.json();
      if (ctx.role === "company_admin") {
        body.company_id = ctx.companyId;
      }

      if (!body.company_id) return badRequest("Missing company_id: Ensure your profile is associated with a company.");
      if (!body.type) return badRequest("Missing 'type' field in request body.");
      if (!body.rules) return badRequest("Missing 'rules' field in request body.");

      const { data, error } = await supabase.from("policies").insert(body).select().single();
      if (error) throw error;

      await logAction(supabase, ctx, "CREATE_POLICY", "policies", data.id, body);
      return jsonResponse(201, { data });
    }

    /* =========================================================================
       PATCH /policies/:id -> Update policy
       ========================================================================= */
    if (method === "PATCH") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return badRequest("Missing policy id");

      if (ctx.role === "employee") return forbidden();

      const body = await req.json();

      if (ctx.role === "company_admin") {
        const { data: existing } = await supabase.from("policies").select("company_id").eq("id", resourceId).single();
        if (!existing || existing.company_id !== ctx.companyId) return forbidden();
        delete body.company_id; // Prevent changing ownership
      }

      const { data, error } = await supabase.from("policies").update(body).eq("id", resourceId).select().single();
      if (error) throw error;

      await logAction(supabase, ctx, "UPDATE_POLICY", "policies", resourceId, body);
      return jsonResponse(200, { data });
    }

    /* =========================================================================
       DELETE /policies/:id -> Delete policy
       ========================================================================= */
    if (method === "DELETE") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return badRequest("Missing policy id");

      if (ctx.role === "employee") return forbidden();

      if (ctx.role === "company_admin") {
        const { data: existing } = await supabase.from("policies").select("company_id").eq("id", resourceId).single();
        if (!existing || existing.company_id !== ctx.companyId) return forbidden();
      }

      const { error } = await supabase.from("policies").delete().eq("id", resourceId);
      if (error) throw error;

      await logAction(supabase, ctx, "DELETE_POLICY", "policies", resourceId);
      return jsonResponse(200, { message: "Policy deleted" });
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});