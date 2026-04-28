/**
 * /functions/v1/leave
 *
 * GET    /                  — list leave requests (role-scoped)
 * GET    /balance           — employee leave balance
 * GET    /types             — leave types for the company
 * POST   /types             — create leave type (company_admin)
 * PUT    /types/:id         — update leave type (company_admin)
 * DELETE /types/:id         — delete leave type (company_admin)
 * POST   /                  — apply for leave (employee)
 * DELETE /:id               — cancel pending leave (employee)
 * PATCH  /:id/approve       — approve leave (company_admin)
 * PATCH  /:id/reject        — reject leave (company_admin)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  createdRes,
  errorRes,
  normalizePath,
  parseQuery,
  handleOptions,
} from "../_shared/responses.ts";

/** Count working days between two dates (Mon-Fri), excluding holidays */
async function countWorkingDays(
  svcClient: ReturnType<typeof createClient>,
  companyId: string,
  fromDate: string,
  toDate: string
): Promise<number> {
  const { data: holidays } = await svcClient
    .from("holidays")
    .select("date")
    .eq("company_id", companyId)
    .gte("date", fromDate)
    .lte("date", toDate);

  const holidaySet = new Set((holidays ?? []).map((h: { date: string }) => h.date));
  let count = 0;
  const current = new Date(fromDate);
  const end = new Date(toDate);

  while (current <= end) {
    const dow = current.getDay();
    const ds = current.toISOString().slice(0, 10);
    if (dow !== 0 && dow !== 6 && !holidaySet.has(ds)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

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
    const path = normalizePath(url.pathname, "leave");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const firstSeg = segments[0] || null;
    const resourceId = firstSeg && !["balance", "types"].includes(firstSeg) ? firstSeg : null;
    const subAction = segments[1] || null;
    const q = parseQuery(url);

    // ═══════════════════════════════════════════════════════
    // GET /balance — employee leave balances
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && firstSeg === "balance") {
      let employeeId = q.employee_id ?? ctx.employeeId;
      if (ctx.role === "employee") employeeId = ctx.employeeId;
      if (!employeeId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "employee_id required" });

      const year = parseInt(q.year ?? String(new Date().getFullYear()));
      const { data, error } = await svcClient
        .from("leave_balances")
        .select("*, leave_types(name, is_paid, annual_quota)")
        .eq("employee_id", employeeId)
        .eq("year", year);
      if (error) throw error;

      const enriched = (data ?? []).map((lb) => ({
        ...lb,
        available: lb.quota + lb.carry_forward - lb.taken - lb.pending,
      }));

      return successRes("Leave balances fetched", enriched);
    }

    // ═══════════════════════════════════════════════════════
    // LEAVE TYPES CRUD
    // ═══════════════════════════════════════════════════════
    if (firstSeg === "types") {
      const typeId = segments[1] || null;

      // GET /types
      if (method === "GET" && !typeId) {
        const companyId = ctx.companyId;
        if (!companyId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated" });
        
        // 1. Get employee's assigned leave policy
        let leavePolicyId = null;
        if (ctx.employeeId) {
          const { data: emp } = await svcClient
            .from("employees")
            .select("leave_policy_id")
            .eq("id", ctx.employeeId)
            .single();
          leavePolicyId = emp?.leave_policy_id;
        }

        // 2. If no policy, try getting default policy for company
        if (!leavePolicyId) {
          const { data: defPolicy } = await svcClient
            .from("leave_policies")
            .select("id")
            .eq("company_id", companyId)
            .eq("is_default", true)
            .maybeSingle();
          leavePolicyId = defPolicy?.id;
        }

        // 3. Fetch types
        let query = svcClient.from("leave_types").select("*").eq("company_id", companyId).eq("is_active", true);
        
        if (leavePolicyId) {
          query = query.eq("leave_policy_id", leavePolicyId);
        } else {
          // Backward compatibility: if no policies exist yet, show all company types
          query = query.is("leave_policy_id", null);
        }

        const { data, error } = await query.order("name");
        if (error) throw error;
        return successRes("Leave types fetched", data);
      }

      // Company admin only from here
      if (ctx.role === "employee")
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

      const companyId = ctx.companyId!;

      // Check plan leave type limit
      if (method === "POST") {
        const body = await req.json();
        const { name, is_paid = true, annual_quota = 0, carry_forward = false,
          max_carry_forward = 0, min_notice_days = 0, requires_document = false, leave_policy_id } = body;

        if (!name)
          return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "name is required" });

        // Plan limit check
        const { data: company } = await svcClient
          .from("companies")
          .select("plan_id, plans(max_leave_types)")
          .eq("id", companyId)
          .single();
        const maxTypes = (company?.plans as Record<string, unknown> & { max_leave_types: number } | null)?.max_leave_types ?? 3;
        if (maxTypes !== -1) {
          const { count } = await svcClient
            .from("leave_types")
            .select("*", { count: "exact", head: true })
            .eq("company_id", companyId)
            .eq("is_active", true);
          if ((count ?? 0) >= maxTypes)
            return jsonRes(403, {
              success: false,
              code: "PLAN_LIMIT_EXCEEDED",
              message: `Leave type limit of ${maxTypes} reached for your current plan. Please upgrade.`,
            });
        }

        // Upsert: if a leave type with this name already exists for the company, update it instead
        const { data, error } = await svcClient
          .from("leave_types")
          .upsert(
            { company_id: companyId, name, is_paid, annual_quota, carry_forward, max_carry_forward, min_notice_days, requires_document, leave_policy_id, is_active: true },
            { onConflict: "company_id,name", ignoreDuplicates: false }
          )
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "UPSERT_LEAVE_TYPE", "leave_types", data.id, body);
        return createdRes("Leave type saved", data);
      }

      if (method === "PUT" && typeId) {
        const body = await req.json();
        delete body.id; delete body.company_id;
        const { data, error } = await svcClient
          .from("leave_types")
          .update(body)
          .eq("id", typeId)
          .eq("company_id", companyId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "UPDATE_LEAVE_TYPE", "leave_types", typeId, body);
        return successRes("Leave type updated", data);
      }

      if (method === "DELETE" && typeId) {
        const { error } = await svcClient
          .from("leave_types")
          .update({ is_active: false })
          .eq("id", typeId)
          .eq("company_id", companyId);
        if (error) throw error;
        await logAction(svcClient, ctx, "DELETE_LEAVE_TYPE", "leave_types", typeId);
        return successRes("Leave type deactivated");
      }
    }

    // ═══════════════════════════════════════════════════════
    // GET / — list leave requests
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !firstSeg) {
      let query = svcClient
        .from("leave_requests")
        .select("*, employees(full_name, employee_code), leave_types(name, is_paid)")
        .order("created_at", { ascending: false });

      if (ctx.role === "employee") {
        if (!ctx.employeeId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });
        query = query.eq("employee_id", ctx.employeeId);
      } else if (ctx.role === "company_admin") {
        query = query.eq("company_id", ctx.companyId!);
      }

      if (q.status) query = query.eq("status", q.status);
      if (q.from) query = query.gte("from_date", q.from);
      if (q.to) query = query.lte("to_date", q.to);

      const { data, error } = await query;
      if (error) throw error;
      return successRes("Leave requests fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST / — apply for leave
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && !firstSeg) {
      const body = await req.json();
      const { leave_type_id, from_date, to_date, reason, document_url } = body;

      const errors: string[] = [];
      if (!leave_type_id) errors.push("leave_type_id is required");
      if (!from_date) errors.push("from_date is required");
      if (!to_date) errors.push("to_date is required");
      if (new Date(to_date) < new Date(from_date)) errors.push("to_date must be on or after from_date");
      if (errors.length > 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: errors[0], errors });

      // SECURITY: company_id always comes from JWT context, never from request body
      const targetCompanyId = ctx.companyId;
      if (!targetCompanyId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

      let employeeId: string | null = null;
      if (ctx.role === "employee") {
        if (!ctx.employeeId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });
        employeeId = ctx.employeeId;
      } else {
        // company_admin applying on behalf of an employee
        employeeId = body.employee_id ?? null;
        if (!employeeId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "employee_id is required" });
        // Verify employee belongs to this company
        const { data: empCheck } = await svcClient
          .from("employees")
          .select("id")
          .eq("id", employeeId)
          .eq("company_id", targetCompanyId)
          .maybeSingle();
        if (!empCheck)
          return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Employee does not belong to your company" });
      }

      // Validate leave type belongs to this company
      const { data: leaveType } = await svcClient
        .from("leave_types")
        .select("*")
        .eq("id", leave_type_id)
        .eq("company_id", targetCompanyId)
        .eq("is_active", true)
        .single();
      if (!leaveType)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Leave type not found or inactive" });

      // Check min notice days (Admins bypass notice rules)
      if (ctx.role === "employee") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fromDateObj = new Date(from_date);
        fromDateObj.setHours(0, 0, 0, 0);

        const noticeDays = Math.floor((fromDateObj.getTime() - today.getTime()) / 86400000);
        
        if (noticeDays < leaveType.min_notice_days) {
          const msg = noticeDays < 0 
            ? "Back-dated leave requests are not allowed for this leave type"
            : `This leave type requires at least ${leaveType.min_notice_days} days advance notice`;

          return jsonRes(400, {
            success: false,
            code: "VALIDATION_ERROR",
            message: msg,
          });
        }
      }

      // Check if employee already has leave on these dates
      const { data: overlapping } = await svcClient
        .from("leave_requests")
        .select("id")
        .eq("employee_id", employeeId)
        .in("status", ["pending", "approved"])
        .lte("from_date", to_date)
        .gte("to_date", from_date)
        .maybeSingle();
      if (overlapping)
        return jsonRes(409, {
          success: false,
          code: "CONFLICT",
          message: "You already have a leave request overlapping with these dates",
        });

      // Calculate working days
      const totalDays = await countWorkingDays(svcClient, targetCompanyId, from_date, to_date);

      // Check leave balance
      const year = fromDateObj.getFullYear();
      const { data: balance } = await svcClient
        .from("leave_balances")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("leave_type_id", leave_type_id)
        .eq("year", year)
        .maybeSingle();

      if (balance) {
        const available = balance.quota + balance.carry_forward - balance.taken - balance.pending;
        if (totalDays > available)
          return jsonRes(400, {
            success: false,
            code: "INSUFFICIENT_BALANCE",
            message: `Insufficient leave balance. Available: ${available} days, Requested: ${totalDays} days`,
          });

        // Reserve pending balance
        await svcClient
          .from("leave_balances")
          .update({ pending: balance.pending + totalDays })
          .eq("id", balance.id);
      }

      const { data, error } = await svcClient
        .from("leave_requests")
        .insert({
          employee_id: employeeId,
          leave_type_id,
          company_id: targetCompanyId,
          from_date,
          to_date,
          total_days: totalDays,
          reason: reason ?? null,
          document_url: document_url ?? null,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "APPLY_LEAVE", "leave_requests", data.id, { from_date, to_date, totalDays });
      return createdRes("Leave application submitted", data);
    }

    // ═══════════════════════════════════════════════════════
    // DELETE /:id — cancel pending leave (employee only)
    // ═══════════════════════════════════════════════════════
    if (method === "DELETE" && resourceId) {
      const { data: existing } = await svcClient
        .from("leave_requests")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (!existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Leave request not found" });

      if (ctx.role === "employee" && existing.employee_id !== ctx.employeeId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });
      if (existing.status !== "pending")
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "Only pending leave requests can be cancelled" });

      // Release pending balance
      const year = new Date(existing.from_date).getFullYear();
      const { data: balance } = await svcClient
        .from("leave_balances")
        .select("*")
        .eq("employee_id", existing.employee_id)
        .eq("leave_type_id", existing.leave_type_id)
        .eq("year", year)
        .maybeSingle();
      if (balance) {
        await svcClient
          .from("leave_balances")
          .update({ pending: Math.max(0, balance.pending - existing.total_days) })
          .eq("id", balance.id);
      }

      await svcClient
        .from("leave_requests")
        .update({ status: "cancelled" })
        .eq("id", resourceId);

      await logAction(svcClient, ctx, "CANCEL_LEAVE", "leave_requests", resourceId);
      return successRes("Leave request cancelled");
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id/approve — approve leave (company_admin)
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId && subAction === "approve") {
      if (ctx.role === "employee")
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin only" });

      const { review_note } = await req.json().catch(() => ({}));

      const { data: existing } = await svcClient
        .from("leave_requests")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (!existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Leave request not found" });
      if (ctx.role === "company_admin" && existing.company_id !== ctx.companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });
      if (existing.status !== "pending")
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "Only pending leave requests can be approved" });

      // Move from pending → taken in balance
      const year = new Date(existing.from_date).getFullYear();
      const { data: balance } = await svcClient
        .from("leave_balances")
        .select("*")
        .eq("employee_id", existing.employee_id)
        .eq("leave_type_id", existing.leave_type_id)
        .eq("year", year)
        .maybeSingle();
      if (balance) {
        await svcClient
          .from("leave_balances")
          .update({
            pending: Math.max(0, balance.pending - existing.total_days),
            taken: balance.taken + existing.total_days,
          })
          .eq("id", balance.id);
      }

      const { data, error } = await svcClient
        .from("leave_requests")
        .update({
          status: "approved",
          reviewed_by: ctx.userId,
          reviewed_at: new Date().toISOString(),
          review_note: review_note ?? null,
        })
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      // Mark attendance as on_leave for approved days
      // (simplified — create on_leave records for each working day)
      const currentDate = new Date(existing.from_date);
      const endDate = new Date(existing.to_date);
      while (currentDate <= endDate) {
        const dow = currentDate.getDay();
        if (dow !== 0 && dow !== 6) {
          await svcClient.from("attendance").upsert(
            {
              employee_id: existing.employee_id,
              company_id: existing.company_id,
              date: currentDate.toISOString().slice(0, 10),
              status: "on_leave",
              is_manual_entry: true,
              manual_reason: "Approved leave",
            },
            { onConflict: "employee_id,date", ignoreDuplicates: true }
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await logAction(svcClient, ctx, "APPROVE_LEAVE", "leave_requests", resourceId, { review_note });
      return successRes("Leave approved", data);
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id/reject — reject leave (company_admin)
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId && subAction === "reject") {
      if (ctx.role === "employee")
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin only" });

      const { review_note } = await req.json().catch(() => ({}));

      const { data: existing } = await svcClient
        .from("leave_requests")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (!existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Leave request not found" });
      if (ctx.role === "company_admin" && existing.company_id !== ctx.companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });
      if (existing.status !== "pending")
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "Only pending leave requests can be rejected" });

      // Release pending balance
      const year = new Date(existing.from_date).getFullYear();
      const { data: balance } = await svcClient
        .from("leave_balances")
        .select("*")
        .eq("employee_id", existing.employee_id)
        .eq("leave_type_id", existing.leave_type_id)
        .eq("year", year)
        .maybeSingle();
      if (balance) {
        await svcClient
          .from("leave_balances")
          .update({ pending: Math.max(0, balance.pending - existing.total_days) })
          .eq("id", balance.id);
      }

      const { data, error } = await svcClient
        .from("leave_requests")
        .update({
          status: "rejected",
          reviewed_by: ctx.userId,
          reviewed_at: new Date().toISOString(),
          review_note: review_note ?? null,
        })
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "REJECT_LEAVE", "leave_requests", resourceId, { review_note });
      return successRes("Leave rejected", data);
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "leave");
  }
});
