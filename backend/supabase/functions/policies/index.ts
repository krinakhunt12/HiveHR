/**
 * /functions/v1/policies
 *
 * Work Policies — ONLY Company Admin can create/edit/delete.
 * Super Admin can read but NOT modify. Employees can read their assigned policy.
 *
 * GET    /           — list policies for company
 * GET    /:id        — policy detail
 * POST   /           — create policy (company_admin only)
 * PUT    /:id        — update policy (company_admin only)
 * DELETE /:id        — delete policy (company_admin only, if no employees assigned)
 * POST   /:id/assign — assign policy to employee or department
 * PATCH  /:id/default — set as default policy
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

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "policies");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resourceId = segments[0] && segments[0] !== "" ? segments[0] : null;
    const subAction = segments[1] || null;

    const companyId = ctx.companyId;

    // ═══════════════════════════════════════════════════════
    // GET / — list all policies
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !resourceId) {
      if (!companyId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated" });

      const { data, error } = await svcClient
        .from("work_policies")
        .select("*")
        .eq("company_id", companyId)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return successRes("Work policies fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // GET /:id — single policy
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && resourceId && !subAction) {
      const { data, error } = await svcClient
        .from("work_policies")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (error) throw error;
      if (companyId && data.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });
      return successRes("Policy fetched", data);
    }

    // ── Writes require company_admin or super_admin (super_admin reads only) ──
    if (method !== "GET" && ctx.role === "employee")
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

    // Super Admin cannot create/modify work policies — this is company territory
    if (method !== "GET" && ctx.role === "super_admin")
      return jsonRes(403, {
        success: false,
        code: "FORBIDDEN",
        message: "Super Admin cannot modify work policies. This is a Company Admin responsibility.",
      });

    if (!companyId)
      return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

    // ═══════════════════════════════════════════════════════
    // POST / — create policy
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && !resourceId) {
      const body = await req.json();
      const {
        policy_name,
        shift_start,
        shift_end,
        total_hours_required = 9,
        break_duration_minutes = 60,
        grace_period_minutes = 15,
        applicable_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        is_default = false,
        is_flexible = false,
      } = body;

      if (!policy_name)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "policy_name is required" });
      if (!applicable_days || applicable_days.length === 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "applicable_days must have at least one day" });

      // Enforce net hours = total - break/60
      const net_work_hours_required = +(total_hours_required - break_duration_minutes / 60).toFixed(2);

      const { data, error } = await svcClient
        .from("work_policies")
        .insert({
          company_id: companyId,
          policy_name,
          shift_start: is_flexible ? null : (shift_start ?? null),
          shift_end: is_flexible ? null : (shift_end ?? null),
          total_hours_required,
          break_duration_minutes,
          net_work_hours_required,
          grace_period_minutes,
          overtime_threshold_minutes: net_work_hours_required * 60,
          half_day_threshold_hours: net_work_hours_required / 2,
          applicable_days,
          is_default,
          is_flexible,
          created_by: ctx.userId,
        })
        .select()
        .single();
      if (error) throw error;

      // If set as default, un-default all others
      if (is_default) {
        await svcClient
          .from("work_policies")
          .update({ is_default: false })
          .eq("company_id", companyId)
          .neq("id", data.id);
      }

      await logAction(svcClient, ctx, "CREATE_POLICY", "work_policies", data.id, body);
      return createdRes("Work policy created", data);
    }

    // ═══════════════════════════════════════════════════════
    // PUT /:id — update policy
    // ═══════════════════════════════════════════════════════
    if (method === "PUT" && resourceId && !subAction) {
      const body = await req.json();

      const { data: existing } = await svcClient
        .from("work_policies")
        .select("company_id, is_default")
        .eq("id", resourceId)
        .single();
      if (!existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Policy not found" });
      if (existing.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      // Prevent removing default status if it's the only policy
      if (body.is_default === false && existing.is_default) {
        const { count } = await svcClient
          .from("work_policies")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId);
        if ((count ?? 0) === 1)
          return jsonRes(400, {
            success: false,
            code: "BAD_REQUEST",
            message: "Cannot remove default status — company must have at least one default policy",
          });
      }

      // Recompute net hours if total or break changed
      if (body.total_hours_required !== undefined || body.break_duration_minutes !== undefined) {
        const total = body.total_hours_required ?? existing.total_hours_required;
        const brk = body.break_duration_minutes ?? existing.break_duration_minutes;
        body.net_work_hours_required = +(total - brk / 60).toFixed(2);
        body.overtime_threshold_minutes = body.net_work_hours_required * 60;
      }

      delete body.id; delete body.company_id; delete body.created_by;

      const { data, error } = await svcClient
        .from("work_policies")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      // If setting as default, un-default others
      if (body.is_default) {
        await svcClient
          .from("work_policies")
          .update({ is_default: false })
          .eq("company_id", companyId)
          .neq("id", resourceId);
      }

      await logAction(svcClient, ctx, "UPDATE_POLICY", "work_policies", resourceId, body);
      return successRes("Work policy updated", data);
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id/default — mark as default
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId && subAction === "default") {
      const { data: existing } = await svcClient
        .from("work_policies")
        .select("company_id")
        .eq("id", resourceId)
        .single();
      if (!existing || existing.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      // Un-default all, then set this one
      await svcClient
        .from("work_policies")
        .update({ is_default: false })
        .eq("company_id", companyId);

      const { data, error } = await svcClient
        .from("work_policies")
        .update({ is_default: true })
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "SET_DEFAULT_POLICY", "work_policies", resourceId);
      return successRes("Default policy updated", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST /:id/assign — assign policy to employee or department
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && resourceId && subAction === "assign") {
      const body = await req.json();
      const { employee_id, department_id } = body;

      if (!employee_id && !department_id)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "employee_id or department_id is required" });

      const { data: policy } = await svcClient
        .from("work_policies")
        .select("company_id")
        .eq("id", resourceId)
        .single();
      if (!policy || policy.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      if (employee_id) {
        await svcClient
          .from("employees")
          .update({ policy_id: resourceId })
          .eq("id", employee_id)
          .eq("company_id", companyId);
      }

      if (department_id) {
        // Assign to all employees in the department who don't have an individual override
        await svcClient
          .from("employees")
          .update({ policy_id: resourceId })
          .eq("department_id", department_id)
          .eq("company_id", companyId)
          .is("policy_id", null);
      }

      await logAction(svcClient, ctx, "ASSIGN_POLICY", "work_policies", resourceId, body);
      return successRes("Policy assigned successfully");
    }

    // ═══════════════════════════════════════════════════════
    // DELETE /:id — delete policy
    // ═══════════════════════════════════════════════════════
    if (method === "DELETE" && resourceId) {
      const { data: existing } = await svcClient
        .from("work_policies")
        .select("company_id, is_default")
        .eq("id", resourceId)
        .single();
      if (!existing || existing.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      if (existing.is_default)
        return jsonRes(400, {
          success: false,
          code: "BAD_REQUEST",
          message: "Cannot delete the default policy. Set another policy as default first.",
        });

      // Check if any employees are assigned to this policy
      const { count } = await svcClient
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("policy_id", resourceId);
      if ((count ?? 0) > 0)
        return jsonRes(400, {
          success: false,
          code: "BAD_REQUEST",
          message: `Cannot delete policy — ${count} employee(s) are currently assigned to it.`,
        });

      const { error } = await svcClient
        .from("work_policies")
        .delete()
        .eq("id", resourceId);
      if (error) throw error;

      await logAction(svcClient, ctx, "DELETE_POLICY", "work_policies", resourceId);
      return successRes("Work policy deleted");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "policies");
  }
});
