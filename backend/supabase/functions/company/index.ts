import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import { jsonRes, normalizePath, corsHeaders, errorRes } from "../_shared/responses.ts";

Deno.serve(async (req: any) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { error: "Unauthorized" });
  
  // RBAC: company_admin or admin
  // RBAC: GET is allowed for all company members, other methods need admin/company_admin
  if (req.method !== "GET" && ctx.role !== "company_admin" && ctx.role !== "admin") {
    return jsonRes(403, { error: "Forbidden" });
  }
  
  const companyId = ctx.companyId;
  if (!companyId) return jsonRes(400, { error: "User is not associated with a company" });

  const url = new URL(req.url);
  const path = normalizePath(url.pathname, "company");
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0] || null;
  const resourceId = segments[1] || null;
  
  try {
    if (resource === "info" || path === "/") {
      if (method === "GET") {
        const { data, error } = await adminClient.from("companies").select("*").eq("id", companyId).single();
        if (error) throw error;
        return jsonRes(200, { data });
      }
      
      if (method === "PATCH") {
        const body = await req.json();
        // Prevent changing id
        delete body.id;
        const { data, error } = await adminClient.from("companies").update(body).eq("id", companyId).select().single();
        if (error) throw error;
        await logAction(adminClient, ctx, "UPDATE_COMPANY", "companies", companyId, body);
        return jsonRes(200, { data });
      }
    }

    if (resource === "leave-configurations") {
      if (method === "GET") {
        const { data, error } = await adminClient
          .from("leave_configurations")
          .select("*")
          .eq("company_id", companyId)
          .order("leave_type");
        if (error) throw error;
        return jsonRes(200, { data });
      }

      if (method === "PUT") {
        const { configurations } = await req.json();
        if (!Array.isArray(configurations)) return jsonRes(400, { error: "configurations must be an array" });

        const rows = configurations.map((c: any) => ({
          company_id: companyId,
          leave_type: c.leave_type,
          annual_allowance: c.annual_allowance
        }));

        const { data, error } = await adminClient
          .from("leave_configurations")
          .upsert(rows, { onConflict: "company_id,leave_type" })
          .select();
        
        if (error) throw error;
        await logAction(adminClient, ctx, "UPDATE_LEAVE_CONFIG", "leave_configurations", companyId, configurations);
        return jsonRes(200, { data });
      }
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    return errorRes(err, "company");
  }
});
