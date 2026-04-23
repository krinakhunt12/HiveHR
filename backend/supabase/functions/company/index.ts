/**
 * /functions/v1/company
 *
 * Company-level management for Company Admin.
 *
 * GET    /info                — company details
 * PATCH  /info                — update company info
 * GET    /dashboard           — dashboard stats
 * GET    /departments         — list departments
 * POST   /departments         — create department
 * PUT    /departments/:id     — update department
 * DELETE /departments/:id     — delete department
 * GET    /designations        — list designations
 * POST   /designations        — create designation
 * DELETE /designations/:id    — delete designation
 * GET    /holidays            — list holidays
 * POST   /holidays            — add holiday
 * DELETE /holidays/:id        — remove holiday
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  createdRes,
  errorRes,
  normalizePath,
  corsHeaders,
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
    if (ctx.role === "employee")
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

    const companyId = ctx.companyId;
    if (!companyId)
      return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "company");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resource = segments[0] || null;
    const resourceId = segments[1] || null;

    // ═══════════════════════════════════════════════════════
    // COMPANY INFO
    // ═══════════════════════════════════════════════════════
    if (!resource || resource === "info") {
      if (method === "GET") {
        const { data, error } = await svcClient
          .from("companies")
          .select("*, plans(*)")
          .eq("id", companyId)
          .single();
        if (error) throw error;
        return successRes("Company info fetched", data);
      }

      if (method === "PATCH") {
        const body = await req.json();
        // Protect fields only Super Admin can change
        delete body.id;
        delete body.plan_id;
        delete body.plan_status;
        delete body.plan_start_date;
        delete body.plan_end_date;
        delete body.created_by;

        const { data, error } = await svcClient
          .from("companies")
          .update(body)
          .eq("id", companyId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "UPDATE_COMPANY", "companies", companyId, body);
        return successRes("Company info updated", data);
      }
    }

    // ═══════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════
    if (resource === "dashboard" && method === "GET") {
      const today = new Date().toISOString().slice(0, 10);

      const [
        { count: totalEmployees },
        { data: todayAttendance },
        { count: pendingLeaves },
      ] = await Promise.all([
        svcClient.from("employees").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
        svcClient.from("attendance").select("status, employee_id").eq("company_id", companyId).eq("date", today),
        svcClient.from("leave_requests").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "pending"),
      ]);

      const stats = {
        total_employees: totalEmployees ?? 0,
        present_today: (todayAttendance ?? []).filter((a) => ["present", "late", "wfh"].includes(a.status)).length,
        absent_today: (todayAttendance ?? []).filter((a) => a.status === "absent").length,
        on_leave_today: (todayAttendance ?? []).filter((a) => a.status === "on_leave").length,
        late_arrivals_today: (todayAttendance ?? []).filter((a) => a.status === "late").length,
        pending_leave_requests: pendingLeaves ?? 0,
      };

      return successRes("Dashboard stats fetched", stats);
    }

    // ═══════════════════════════════════════════════════════
    // DEPARTMENTS
    // ═══════════════════════════════════════════════════════
    if (resource === "departments") {
      if (method === "GET") {
        const { data, error } = await svcClient
          .from("departments")
          .select("*, employees!head_id(id, full_name)")
          .eq("company_id", companyId)
          .order("name");
        if (error) throw error;

        // Add employee count per department
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

      if (method === "POST") {
        const body = await req.json();
        if (!body.name)
          return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "Department name is required" });

        // Check plan department limit
        const { data: company } = await svcClient
          .from("companies")
          .select("plan_id, plans(max_departments)")
          .eq("id", companyId)
          .single();
        const maxDepts = (company?.plans as Record<string, unknown> & { max_departments: number } | null)?.max_departments ?? 2;
        if (maxDepts !== -1) {
          const { count } = await svcClient
            .from("departments")
            .select("*", { count: "exact", head: true })
            .eq("company_id", companyId);
          if ((count ?? 0) >= maxDepts)
            return jsonRes(403, {
              success: false,
              code: "PLAN_LIMIT_EXCEEDED",
              message: `Department limit of ${maxDepts} reached for your current plan. Please upgrade.`,
            });
        }

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
    }

    // ═══════════════════════════════════════════════════════
    // DESIGNATIONS
    // ═══════════════════════════════════════════════════════
    if (resource === "designations") {
      if (method === "GET") {
        const { data, error } = await svcClient
          .from("designations")
          .select("*")
          .eq("company_id", companyId)
          .order("name");
        if (error) throw error;
        return successRes("Designations fetched", data);
      }

      if (method === "POST") {
        const body = await req.json();
        if (!body.name)
          return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "Designation name is required" });
        const { data, error } = await svcClient
          .from("designations")
          .insert({ company_id: companyId, name: body.name })
          .select()
          .single();
        if (error) throw error;
        return createdRes("Designation created", data);
      }

      if (method === "DELETE" && resourceId) {
        const { error } = await svcClient
          .from("designations")
          .delete()
          .eq("id", resourceId)
          .eq("company_id", companyId);
        if (error) throw error;
        return successRes("Designation deleted");
      }
    }

    // ═══════════════════════════════════════════════════════
    // HOLIDAYS
    // ═══════════════════════════════════════════════════════
    if (resource === "holidays") {
      if (method === "GET") {
        const { data, error } = await svcClient
          .from("holidays")
          .select("*")
          .eq("company_id", companyId)
          .order("date");
        if (error) throw error;
        return successRes("Holidays fetched", data);
      }

      if (method === "POST") {
        const body = await req.json();
        if (!body.name || !body.date)
          return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "name and date are required" });
        const { data, error } = await svcClient
          .from("holidays")
          .insert({ company_id: companyId, name: body.name, date: body.date })
          .select()
          .single();
        if (error) throw error;
        return createdRes("Holiday added", data);
      }

      if (method === "DELETE" && resourceId) {
        const { error } = await svcClient
          .from("holidays")
          .delete()
          .eq("id", resourceId)
          .eq("company_id", companyId);
        if (error) throw error;
        return successRes("Holiday removed");
      }
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "company");
  }
});
