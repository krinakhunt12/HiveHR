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
  const supabase = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();
  if (ctx.role !== "admin") return forbidden();

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0]; // companies | users | employees | attendance | leaves
  const resourceId = segments[1] || null;

  try {
    /* =========================================================================
       COMPANIES MANAGEMENT
       ========================================================================= */
    if (resource === "companies") {
      if (method === "GET") {
        const { data, error } = await supabase.from("companies").select("*").order("name");
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("companies").insert(body).select().single();
        if (error) throw error;
        await logAction(supabase, ctx, "CREATE", "companies", data.id, body);
        return jsonResponse(201, { data });
      }

      if (method === "PATCH" && resourceId) {
        const body = await req.json();
        const { data, error } = await supabase.from("companies").update(body).eq("id", resourceId).select().single();
        if (error) throw error;
        await logAction(supabase, ctx, "UPDATE", "companies", resourceId, body);
        return jsonResponse(200, { data });
      }

      if (method === "DELETE" && resourceId) {
        const { error } = await supabase.from("companies").delete().eq("id", resourceId);
        if (error) throw error;
        await logAction(supabase, ctx, "DELETE", "companies", resourceId);
        return jsonResponse(200, { message: "Company deleted" });
      }
    }

    /* =========================================================================
       USER & ROLE MANAGEMENT
       ========================================================================= */
    if (resource === "users") {
      if (method === "GET") {
        const { data, error } = await supabase.from("profiles").select("*, companies(name)").order("created_at", { ascending: false });
        if (error) throw error;
        return jsonResponse(200, { data });
      }

      if (method === "PATCH" && resourceId) {
        const body = await req.json();
        const { role, company_id, full_name } = body;
        
        const { data, error } = await supabase.from("profiles").update({ role, company_id, full_name }).eq("user_id", resourceId).select().single();
        if (error) throw error;

        // Role Sync with Supabase Auth
        if (role) {
          await supabase.auth.admin.updateUserById(resourceId, {
            app_metadata: { role },
            user_metadata: { role }
          });
        }

        await logAction(supabase, ctx, "UPDATE_USER", "profiles", resourceId, body);
        return jsonResponse(200, { data });
      }
    }

    /* =========================================================================
       SYSTEM-WIDE TRACE (Employees, Attendance, Leaves)
       ========================================================================= */
    if (resource === "employees") {
      const { data, error } = await supabase.from("employees").select("*, companies(name)");
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    if (resource === "attendance") {
      const { data, error } = await supabase.from("attendance").select("*, employees(full_name), companies(name)");
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    if (resource === "leaves") {
      const { data, error } = await supabase.from("leaves").select("*, employees(full_name), companies(name)");
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});
