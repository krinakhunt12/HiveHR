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
    ["functions", "v1", "employee"].includes(segments[0])
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
  if (ctx.role !== "company_admin" && ctx.role !== "admin") return forbidden();
  
  const companyId = ctx.companyId;
  if (!companyId) return badRequest("Context: No company ID found");

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resourceId = (segments[0] && segments[0] !== "") ? segments[0] : null;

  try {
    // GET /employee -> List all employees in company
    if (method === "GET" && !resourceId) {
      const { data, error } = await supabase
        .from("employees")
        .select("*, profiles(full_name, role)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    // POST /employee -> Create employee (Auth + Profile + Employee)
    if (method === "POST" && !resourceId) {
      const body = await req.json();
      const { email, password, full_name, role = "employee", ...rest } = body;

      if (!email || !password || !full_name) {
          return badRequest("Missing required fields: email, password, full_name");
      }

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, company_id: companyId },
        app_metadata: { role }
      });
      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Create Profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: userId,
        full_name,
        role,
        company_id: companyId,
      });
      if (profileError) throw profileError;

      // 3. Create Employee Record
      const { data: empData, error: empError } = await supabase.from("employees").insert({
        ...rest,
        full_name, // Fix: Include full_name in the employee record
        user_id: userId,
        company_id: companyId,
      }).select().single();
      if (empError) throw empError;

      await logAction(supabase, ctx, "CREATE_EMPLOYEE", "employees", empData.id, { email, role });
      return jsonResponse(201, { data: empData });
    }

    // PATCH /employee/:id -> Update employee
    if (method === "PATCH" && resourceId) {
      const body = await req.json();
      // Ensure the employee belongs to this company
      const { data: existing } = await supabase.from("employees").select("company_id").eq("id", resourceId).single();
      if (!existing || existing.company_id !== companyId) return forbidden();

      const { data, error } = await supabase.from("employees").update(body).eq("id", resourceId).select().single();
      if (error) throw error;
      
      await logAction(supabase, ctx, "UPDATE_EMPLOYEE", "employees", resourceId, body);
      return jsonResponse(200, { data });
    }

    // DELETE /employee/:id -> Delete employee (and Auth?)
    if (method === "DELETE" && resourceId) {
       const { data: existing } = await supabase.from("employees").select("user_id, company_id").eq("id", resourceId).single();
       if (!existing || existing.company_id !== companyId) return forbidden();

       // We might NOT want to delete the Auth user, but deactivate them. 
       // For this task, we'll just delete the employee record or mark inactive.
       const { error } = await supabase.from("employees").delete().eq("id", resourceId);
       if (error) throw error;

       await logAction(supabase, ctx, "DELETE_EMPLOYEE", "employees", resourceId);
       return jsonResponse(200, { message: "Employee removed from company" });
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});
