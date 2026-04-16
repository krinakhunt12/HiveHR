import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  forbidden,
  logAction,
  badRequest,
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
  const supabase = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();
  
  // RBAC: company_admin or admin
  // RBAC: GET is allowed for all company members, other methods need admin/company_admin
  if (req.method !== "GET" && ctx.role !== "company_admin" && ctx.role !== "admin") {
    return forbidden();
  }
  
  const companyId = ctx.companyId;
  if (!companyId) return badRequest("User is not associated with a company");

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0]; // info | settings
  
  try {
    if (resource === "info" || path === "/") {
      if (method === "GET") {
        const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();
        if (error) throw error;
        return jsonResponse(200, { data });
      }
      
      if (method === "PATCH") {
        const body = await req.json();
        // Prevent changing id
        delete body.id;
        const { data, error } = await supabase.from("companies").update(body).eq("id", companyId).select().single();
        if (error) throw error;
        await logAction(supabase, ctx, "UPDATE_COMPANY", "companies", companyId, body);
        return jsonResponse(200, { data });
      }
    }

    if (resource === "leave-configurations") {
      if (method === "GET") {
        const { data, error } = await supabase
          .from("leave_configurations")
          .select("*")
          .eq("company_id", companyId)
          .order("leave_type");
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      if (method === "PUT") {
        const { configurations } = await req.json();
        if (!Array.isArray(configurations)) return badRequest("configurations must be an array");

        const rows = configurations.map((c: any) => ({
          company_id: companyId,
          leave_type: c.leave_type,
          annual_allowance: c.annual_allowance
        }));

        const { data, error } = await supabase
          .from("leave_configurations")
          .upsert(rows, { onConflict: "company_id,leave_type" })
          .select();
        
        if (error) throw error;
        await logAction(supabase, ctx, "UPDATE_LEAVE_CONFIG", "leave_configurations", companyId, configurations);
        return jsonResponse(200, { data });
      }
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});
