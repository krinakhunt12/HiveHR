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
  if (ctx.role !== "company_admin" && ctx.role !== "admin") return jsonRes(403, { error: "Forbidden" });
  
  const companyId = ctx.companyId;
  if (!companyId) return jsonRes(400, { error: "Context: No company ID found" });

  const url = new URL(req.url);
  const path = normalizePath(url.pathname, "employee");
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const resource = segments[0] || null;
  const resourceId = segments[1] || null;

  try {
    // GET /employee -> List all employees in company
    if (method === "GET" && !resource) {
      const { data, error } = await adminClient
        .from("employees")
        .select("*, profiles(full_name, role)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonRes(200, { data });
    }

    // POST /employee -> Create employee (Auth + Profile + Employee)
    if (method === "POST" && !resource) {
      const body = await req.json();
      const { email, password, full_name, role = "employee", ...rest } = body;

      if (!email || !password || !full_name) {
          return jsonRes(400, { error: "Missing required fields: email, password, full_name" });
      }

      // 1. Create Auth User
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, company_id: companyId },
        app_metadata: { role }
      });
      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Create Profile
      const { error: profileError } = await adminClient.from("profiles").upsert({
        user_id: userId,
        full_name,
        role,
        company_id: companyId,
      });
      if (profileError) throw profileError;

      // 3. Create Employee Record
      const { data: empData, error: empError } = await adminClient.from("employees").insert({
        ...rest,
        full_name, // Fix: Include full_name in the employee record
        user_id: userId,
        company_id: companyId,
      }).select().single();
      if (empError) throw empError;

      await logAction(adminClient, ctx, "CREATE_EMPLOYEE", "employees", empData.id, { email, role });
      return jsonRes(201, { data: empData });
    }

    // PATCH /employee/:id -> Update employee
    if (method === "PATCH" && resource) {
      const body = await req.json();
      // Ensure the employee belongs to this company
      const { data: existing } = await adminClient.from("employees").select("company_id").eq("id", resource).single();
      if (!existing || existing.company_id !== companyId) return jsonRes(403, { error: "Forbidden" });

      const { data, error } = await adminClient.from("employees").update(body).eq("id", resource).select().single();
      if (error) throw error;
      
      await logAction(adminClient, ctx, "UPDATE_EMPLOYEE", "employees", resource, body);
      return jsonRes(200, { data });
    }

    // DELETE /employee/:id -> Delete employee (and Auth?)
    if (method === "DELETE" && resource) {
       const { data: existing } = await adminClient.from("employees").select("user_id, company_id").eq("id", resource).single();
       if (!existing || existing.company_id !== companyId) return jsonRes(403, { error: "Forbidden" });

       // We might NOT want to delete the Auth user, but deactivate them. 
       // For this task, we'll just delete the employee record or mark inactive.
       const { error } = await adminClient.from("employees").delete().eq("id", resource);
       if (error) throw error;

       await logAction(adminClient, ctx, "DELETE_EMPLOYEE", "employees", resource);
       return jsonRes(200, { message: "Employee removed from company" });
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    return errorRes(err, "employee");
  }
});
