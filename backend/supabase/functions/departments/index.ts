/**
 * /functions/v1/departments
 *
 * Standalone departments function (also handled under /company/departments).
 * Kept separate for direct API access.
 *
 * GET    /           — list departments for company
 * POST   /           — create department
 * PUT    /:id        — update department
 * DELETE /:id        — delete department
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  createdRes,
  errorRes,
  normalizePath,
  handleOptions,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  try {
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ctx = await getUserContext(req);
    if (!ctx) return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

    const companyId = ctx.companyId;
    if (!companyId)
      return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "departments");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resourceId = segments[0] && segments[0] !== "" ? segments[0] : null;

    // GET / — list all departments
    if (method === "GET" && !resourceId) {
      const { data, error } = await svcClient
        .from("departments")
        .select("*, employees!head_id(id, full_name)")
        .eq("company_id", companyId)
        .order("name");
      if (error) throw error;

      const enriched = await Promise.all(
        (data ?? []).map(async (dept: Record<string, unknown>) => {
          const { count } = await svcClient
            .from("employees")
            .select("*", { count: "exact", head: true })
            .eq("department_id", dept.id as string)
            .eq("status", "active");
          return { ...dept, employee_count: count ?? 0 };
        })
      );
      return successRes("Departments fetched", enriched);
    }

    // GET /:id
    if (method === "GET" && resourceId) {
      const { data, error } = await svcClient
        .from("departments")
        .select("*")
        .eq("id", resourceId)
        .eq("company_id", companyId)
        .single();
      if (error) throw error;
      return successRes("Department fetched", data);
    }

    // Write operations — company_admin only
    if (ctx.role === "employee")
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

    if (method === "POST") {
      const body = await req.json();
      if (!body.name)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "name is required" });

      const { data, error } = await svcClient
        .from("departments")
        .insert({ company_id: companyId, name: body.name, head_id: body.head_id ?? null })
        .select()
        .single();
      if (error) throw error;
      await logAction(svcClient, ctx, "CREATE_DEPARTMENT", "departments", data.id, body);
      return createdRes("Department created", data);
    }

    if (method === "PUT" && resourceId) {
      const body = await req.json();
      delete body.id; delete body.company_id;
      const { data, error } = await svcClient
        .from("departments")
        .update(body)
        .eq("id", resourceId)
        .eq("company_id", companyId)
        .select()
        .single();
      if (error) throw error;
      await logAction(svcClient, ctx, "UPDATE_DEPARTMENT", "departments", resourceId, body);
      return successRes("Department updated", data);
    }

    if (method === "DELETE" && resourceId) {
      const { error } = await svcClient
        .from("departments")
        .delete()
        .eq("id", resourceId)
        .eq("company_id", companyId);
      if (error) throw error;
      await logAction(svcClient, ctx, "DELETE_DEPARTMENT", "departments", resourceId);
      return successRes("Department deleted");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "departments");
  }
});
