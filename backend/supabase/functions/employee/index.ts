/**
 * /functions/v1/employee
 *
 * Accessible by company_admin (and super_admin for reads).
 * Employees use the /profile function for their own data.
 *
 * GET    /          — list all employees in company (paginated)
 * POST   /          — create employee (auth + profile + employee record)
 * GET    /:id       — employee detail
 * PATCH  /:id       — update employee info
 * PATCH  /:id/status — activate / deactivate / probation
 * DELETE /:id       — soft-delete (set status=inactive) or hard delete
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
  parseQuery,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const svcClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });
  if (ctx.role === "employee")
    return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

  // Super admin can read across all companies; company_admin scoped to own
  const companyId = ctx.role === "super_admin" ? null : ctx.companyId;
  if (ctx.role === "company_admin" && !companyId)
    return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with this account" });

  const url = new URL(req.url);
  const path = normalizePath(url.pathname, "employee");
  const method = req.method;
  const segments = path.replace(/^\//, "").split("/");
  const resourceId = segments[0] && segments[0] !== "" ? segments[0] : null;
  const subAction = segments[1] || null;
  const q = parseQuery(url);

  try {
    // ═══════════════════════════════════════════════════════
    // GET / — list employees
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !resourceId) {
      let query = svcClient
        .from("employees")
        .select(`
          *,
          departments(id, name),
          designations(id, name),
          work_policies(id, policy_name)
        `)
        .order("full_name");

      if (companyId) query = query.eq("company_id", companyId);
      if (q.department_id) query = query.eq("department_id", q.department_id);
      if (q.status) query = query.eq("status", q.status);
      if (q.search) query = query.ilike("full_name", `%${q.search}%`);

      // Pagination
      const page = parseInt(q.page ?? "1");
      const limit = Math.min(parseInt(q.limit ?? "10"), 100);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return successRes("Employees fetched", data, {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      });
    }

    // ═══════════════════════════════════════════════════════
    // GET /:id — single employee
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && resourceId && !subAction) {
      const { data, error } = await svcClient
        .from("employees")
        .select(`
          *,
          departments(id, name),
          designations(id, name),
          work_policies(*)
        `)
        .eq("id", resourceId)
        .single();

      if (error) throw error;

      // Company admin can only see their own employees
      if (companyId && data.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      return successRes("Employee fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST / — create employee
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && !resourceId) {
      const body = await req.json();
      const {
        email,
        password,
        full_name,
        designation_id,
        department_id,
        employee_code,
        date_of_joining,
        employment_type = "full_time",
        work_location = "office",
        phone,
        date_of_birth,
        gender,
        emergency_contact,
        policy_id,
      } = body;

      // Validate required
      const errors: string[] = [];
      if (!email) errors.push("email is required");
      if (!password || password.length < 8) errors.push("password must be at least 8 characters");
      if (!full_name) errors.push("full_name is required");
      if (!date_of_joining) errors.push("date_of_joining is required");

      if (errors.length > 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: errors[0], errors });

      const targetCompanyId = companyId ?? body.company_id;
      if (!targetCompanyId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "company_id is required" });

      // Check plan employee limit
      const { data: company } = await svcClient
        .from("companies")
        .select("plan_id, plans(max_employees)")
        .eq("id", targetCompanyId)
        .single();

      const maxEmployees = (company?.plans as Record<string, unknown> & { max_employees: number } | null)?.max_employees ?? 10;
      if (maxEmployees !== -1) {
        const { count: empCount } = await svcClient
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("company_id", targetCompanyId)
          .eq("status", "active");
        if ((empCount ?? 0) >= maxEmployees)
          return jsonRes(403, {
            success: false,
            code: "PLAN_LIMIT_EXCEEDED",
            message: `Employee limit of ${maxEmployees} reached for your current plan. Please upgrade.`,
          });
      }

      // Auto-generate employee_code if not provided
      const finalCode =
        employee_code ??
        `EMP-${Date.now().toString().slice(-6)}`;

      // 1. Create Auth user
      const { data: authData, error: authErr } =
        await svcClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role: "employee", company_id: targetCompanyId },
          app_metadata: { role: "employee" },
        });
      if (authErr) throw authErr;
      const userId = authData.user.id;

      // 2. Upsert profile
      await svcClient.from("profiles").upsert(
        { user_id: userId, full_name, role: "employee", company_id: targetCompanyId },
        { onConflict: "user_id" }
      );

      // 3. Create employee record
      const { data: empData, error: empErr } = await svcClient
        .from("employees")
        .insert({
          user_id: userId,
          company_id: targetCompanyId,
          department_id: department_id ?? null,
          designation_id: designation_id ?? null,
          policy_id: policy_id ?? null,
          employee_code: finalCode,
          full_name,
          email,
          phone: phone ?? null,
          date_of_birth: date_of_birth ?? null,
          gender: gender ?? null,
          emergency_contact: emergency_contact ?? null,
          date_of_joining,
          employment_type,
          work_location,
          status: "active",
        })
        .select()
        .single();
      if (empErr) throw empErr;

      // 4. Company membership
      await svcClient.from("company_memberships").upsert(
        { company_id: targetCompanyId, user_id: userId, role: "employee" },
        { onConflict: "company_id,user_id" }
      );

      // 5. Seed leave balances for current year
      const currentYear = new Date().getFullYear();
      const { data: leaveTypes } = await svcClient
        .from("leave_types")
        .select("id, annual_quota")
        .eq("company_id", targetCompanyId)
        .eq("is_active", true);

      if (leaveTypes && leaveTypes.length > 0) {
        await svcClient.from("leave_balances").insert(
          leaveTypes.map((lt) => ({
            employee_id: empData.id,
            leave_type_id: lt.id,
            year: currentYear,
            quota: lt.annual_quota,
          }))
        );
      }

      await logAction(svcClient, ctx, "CREATE_EMPLOYEE", "employees", empData.id, { email, targetCompanyId });
      return createdRes("Employee created successfully", empData);
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id — update employee info
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId && !subAction) {
      const body = await req.json();

      // Verify ownership
      const { data: existing, error: exErr } = await svcClient
        .from("employees")
        .select("company_id")
        .eq("id", resourceId)
        .single();
      if (exErr || !existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Employee not found" });
      if (companyId && existing.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      // Strip protected fields
      delete body.id;
      delete body.user_id;
      delete body.company_id;
      delete body.employee_code;

      const { data, error } = await svcClient
        .from("employees")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "UPDATE_EMPLOYEE", "employees", resourceId, body);
      return successRes("Employee updated", data);
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id/status — change employee status
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId && subAction === "status") {
      const { status } = await req.json();
      if (!["active", "inactive", "probation"].includes(status))
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "Invalid status" });

      const { data: existing } = await svcClient
        .from("employees")
        .select("company_id")
        .eq("id", resourceId)
        .single();
      if (companyId && existing?.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      const { data, error } = await svcClient
        .from("employees")
        .update({ status })
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "UPDATE_EMPLOYEE_STATUS", "employees", resourceId, { status });
      return successRes("Employee status updated", data);
    }

    // ═══════════════════════════════════════════════════════
    // DELETE /:id — deactivate employee
    // ═══════════════════════════════════════════════════════
    if (method === "DELETE" && resourceId) {
      const { data: existing } = await svcClient
        .from("employees")
        .select("company_id, user_id")
        .eq("id", resourceId)
        .single();
      if (companyId && existing?.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      // Soft-delete: mark inactive rather than hard delete
      const { error } = await svcClient
        .from("employees")
        .update({ status: "inactive" })
        .eq("id", resourceId);
      if (error) throw error;

      await logAction(svcClient, ctx, "DEACTIVATE_EMPLOYEE", "employees", resourceId);
      return successRes("Employee deactivated");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "employee");
  }
});
