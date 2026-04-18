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
       GET /policies -> List policies
       ========================================================================= */
    if (method === "GET") {
      let query = adminClient.from("policies").select("*");

      if (ctx.role === "employee" || ctx.role === "company_admin") {
        if (!ctx.companyId) return jsonRes(400, { error: "Context: No company ID found" });
        query = query.eq("company_id", ctx.companyId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return jsonRes(200, { data });
    }

    /* =========================================================================
       POST /policies -> Create policy (Admin/CompanyAdmin only)
       ========================================================================= */
    if (method === "POST") {
      if (ctx.role === "employee") return jsonRes(403, { error: "Forbidden" });

      const body = await req.json();
      if (ctx.role === "company_admin") {
        body.company_id = ctx.companyId;
      }

      if (!body.company_id) return jsonRes(400, { error: "Missing company_id: Ensure your profile is associated with a company." });
      if (!body.type) return jsonRes(400, { error: "Missing 'type' field in request body." });
      if (!body.rules) return jsonRes(400, { error: "Missing 'rules' field in request body." });

      const { data, error } = await adminClient.from("policies").insert(body).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "CREATE_POLICY", "policies", data.id, body);
      return jsonRes(201, { data });
    }

    /* =========================================================================
       PATCH /policies/:id -> Update policy
       ========================================================================= */
    if (method === "PATCH") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return jsonRes(400, { error: "Missing policy id" });

      if (ctx.role === "employee") return jsonRes(403, { error: "Forbidden" });

      const body = await req.json();

      if (ctx.role === "company_admin") {
        const { data: existing } = await adminClient.from("policies").select("company_id").eq("id", resourceId).single();
        if (!existing || existing.company_id !== ctx.companyId) return jsonRes(403, { error: "Forbidden" });
        delete body.company_id; // Prevent changing ownership
      }

      const { data, error } = await adminClient.from("policies").update(body).eq("id", resourceId).select().single();
      if (error) throw error;

      await logAction(adminClient, ctx, "UPDATE_POLICY", "policies", resourceId, body);
      return jsonRes(200, { data });
    }

    /* =========================================================================
       DELETE /policies/:id -> Delete policy
       ========================================================================= */
    if (method === "DELETE") {
      const segments = path.replace(/^\//, "").split("/");
      const resourceId = segments[0] || null;
      if (!resourceId) return jsonRes(400, { error: "Missing policy id" });

      if (ctx.role === "employee") return jsonRes(403, { error: "Forbidden" });

      if (ctx.role === "company_admin") {
        const { data: existing } = await adminClient.from("policies").select("company_id").eq("id", resourceId).single();
        if (!existing || existing.company_id !== ctx.companyId) return jsonRes(403, { error: "Forbidden" });
      }

      const { error } = await adminClient.from("policies").delete().eq("id", resourceId);
      if (error) throw error;

      await logAction(adminClient, ctx, "DELETE_POLICY", "policies", resourceId);
      return jsonRes(200, { message: "Policy deleted" });
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    return jsonRes(400, { error: err.message });
  }
});
