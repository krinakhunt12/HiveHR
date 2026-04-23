/**
 * /functions/v1/attendance
 *
 * GET    /                  — list attendance (scoped by role)
 * GET    /summary           — monthly summary for employee
 * POST   /                  — check-in (punch in)
 * PATCH  /:id               — check-out / admin correction
 * POST   /manual            — company_admin manual attendance entry
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
  handleOptions,
} from "../_shared/responses.ts";

/** Minutes between two ISO timestamps */
function minutesBetween(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
}

/** Compute attendance status based on policy and actual times */
function computeStatus(
  netMinutes: number,
  lateMinutes: number,
  requiredNetMinutes: number,
  halfDayThreshold: number
): string {
  if (netMinutes < halfDayThreshold * 60) return "half_day";
  if (lateMinutes > 0) return "late";
  return "present";
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
    const path = normalizePath(url.pathname, "attendance");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resourceId = segments[0] && !["summary", "manual"].includes(segments[0]) ? segments[0] : null;
    const subPath = segments[0] || null;
    const q = parseQuery(url);

    // ═══════════════════════════════════════════════════════
    // GET /summary — employee monthly summary
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && subPath === "summary") {
      if (ctx.role !== "employee" || !ctx.employeeId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Employee access only" });

      const month = q.month ?? new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data, error } = await svcClient
        .from("attendance")
        .select("status, net_work_minutes, overtime_minutes, late_minutes, date")
        .eq("employee_id", ctx.employeeId)
        .gte("date", `${month}-01`)
        .lte("date", `${month}-31`);
      if (error) throw error;

      const summary = {
        present: 0, absent: 0, late: 0, half_day: 0,
        on_leave: 0, holiday: 0, total_net_minutes: 0,
        total_overtime_minutes: 0,
      };
      for (const row of data ?? []) {
        const s = row.status as keyof typeof summary;
        if (s in summary && typeof summary[s] === "number") (summary[s] as number)++;
        summary.total_net_minutes += row.net_work_minutes ?? 0;
        summary.total_overtime_minutes += row.overtime_minutes ?? 0;
      }
      return successRes("Summary fetched", summary);
    }

    // ═══════════════════════════════════════════════════════
    // GET / — list attendance records
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !resourceId && subPath !== "summary") {
      let query = svcClient
        .from("attendance")
        .select("*, employees(full_name, employee_code)")
        .order("date", { ascending: false });

      if (ctx.role === "employee") {
        if (!ctx.employeeId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });
        query = query.eq("employee_id", ctx.employeeId);
      } else if (ctx.role === "company_admin") {
        if (!ctx.companyId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated" });
        query = query.eq("company_id", ctx.companyId);
      }

      // Filters
      if (q.date) query = query.eq("date", q.date);
      if (q.from) query = query.gte("date", q.from);
      if (q.to) query = query.lte("date", q.to);
      if (q.status) query = query.eq("status", q.status);
      if (q.employee_id && ctx.role !== "employee")
        query = query.eq("employee_id", q.employee_id);
      if (q.department_id && ctx.role !== "employee") {
        const { data: deptEmps } = await svcClient
          .from("employees")
          .select("id")
          .eq("department_id", q.department_id);
        const empIds = (deptEmps ?? []).map((e: { id: string }) => e.id);
        query = query.in("employee_id", empIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return successRes("Attendance fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST / — check-in (punch in)
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && subPath !== "manual") {
      const body = await req.json();
      const today = new Date().toISOString().slice(0, 10);

      let employeeId = body.employee_id;
      let targetCompanyId = body.company_id;

      if (ctx.role === "employee") {
        if (!ctx.employeeId)
          return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });
        employeeId = ctx.employeeId;
        targetCompanyId = ctx.companyId;
      }

      if (!employeeId || !targetCompanyId)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "employee_id and company_id are required" });

      const date = body.date ?? today;

      // Only one attendance record per day
      const { data: existing } = await svcClient
        .from("attendance")
        .select("id, check_in_time")
        .eq("employee_id", employeeId)
        .eq("date", date)
        .maybeSingle();

      if (existing)
        return successRes("Already checked in for this date", existing);

      // Get applicable work policy for late/overtime calculation
      const { data: employee } = await svcClient
        .from("employees")
        .select("policy_id, department_id")
        .eq("id", employeeId)
        .single();

      // Policy priority: employee > department > company default
      let policyId = employee?.policy_id ?? null;
      if (!policyId) {
        const { data: defaultPolicy } = await svcClient
          .from("work_policies")
          .select("id")
          .eq("company_id", targetCompanyId)
          .eq("is_default", true)
          .maybeSingle();
        policyId = defaultPolicy?.id ?? null;
      }

      // Compute late_minutes if policy has fixed shift_start
      let lateMinutes = 0;
      const checkInNow = new Date();
      if (policyId) {
        const { data: policy } = await svcClient
          .from("work_policies")
          .select("shift_start, grace_period_minutes, is_flexible")
          .eq("id", policyId)
          .single();

        if (policy && !policy.is_flexible && policy.shift_start) {
          const [sh, sm] = (policy.shift_start as string).split(":").map(Number);
          const shiftStart = new Date(checkInNow);
          shiftStart.setHours(sh, sm, 0, 0);
          const graceEnd = new Date(shiftStart.getTime() + (policy.grace_period_minutes ?? 15) * 60000);
          if (checkInNow > graceEnd) {
            lateMinutes = Math.round((checkInNow.getTime() - graceEnd.getTime()) / 60000);
          }
        }
      }

      const { data, error } = await svcClient
        .from("attendance")
        .insert({
          employee_id: employeeId,
          company_id: targetCompanyId,
          policy_id: policyId,
          date,
          check_in_time: checkInNow.toTimeString().slice(0, 8),
          status: lateMinutes > 0 ? "late" : (body.status ?? "present"),
          late_minutes: lateMinutes,
          break_minutes: body.break_minutes ?? 60,
          is_manual_entry: false,
        })
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "CHECK_IN", "attendance", data.id, { date, employeeId });
      return createdRes("Checked in successfully", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST /manual — admin manual attendance entry
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && subPath === "manual") {
      if (ctx.role === "employee")
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin only" });

      const body = await req.json();
      const { employee_id, date, check_in_time, check_out_time, status, manual_reason, break_minutes = 60 } = body;

      const errors: string[] = [];
      if (!employee_id) errors.push("employee_id is required");
      if (!date) errors.push("date is required");
      if (!manual_reason) errors.push("manual_reason is required for manual entries");
      if (errors.length > 0)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: errors[0], errors });

      // Ensure employee belongs to this company
      const { data: emp } = await svcClient
        .from("employees")
        .select("company_id")
        .eq("id", employee_id)
        .single();
      if (ctx.role === "company_admin" && emp?.company_id !== ctx.companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      const insertPayload: Record<string, unknown> = {
        employee_id,
        company_id: emp?.company_id,
        date,
        check_in_time: check_in_time ?? null,
        check_out_time: check_out_time ?? null,
        break_minutes,
        status: status ?? "present",
        is_manual_entry: true,
        manual_reason,
      };

      // Compute work minutes if both times provided
      if (check_in_time && check_out_time) {
        const start = new Date(`${date}T${check_in_time}`);
        const end = new Date(`${date}T${check_out_time}`);
        const rawMin = Math.round((end.getTime() - start.getTime()) / 60000);
        insertPayload.raw_hours_minutes = rawMin;
        insertPayload.net_work_minutes = Math.max(0, rawMin - break_minutes);
      }

      const { data, error } = await svcClient
        .from("attendance")
        .upsert(insertPayload, { onConflict: "employee_id,date" })
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "MANUAL_ATTENDANCE", "attendance", data.id, insertPayload);
      return successRes("Manual attendance entry saved", data);
    }

    // ═══════════════════════════════════════════════════════
    // PATCH /:id — check-out or admin update
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && resourceId) {
      const body = await req.json();

      const { data: existing, error: exErr } = await svcClient
        .from("attendance")
        .select("*")
        .eq("id", resourceId)
        .single();
      if (exErr || !existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Attendance record not found" });

      // Employee can only update their own record for check-out
      if (ctx.role === "employee") {
        if (existing.employee_id !== ctx.employeeId)
          return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

        // Auto check-out time
        if (!body.check_out_time)
          body.check_out_time = new Date().toTimeString().slice(0, 8);

        // Compute work minutes
        if (existing.check_in_time) {
          const base = existing.date;
          const start = new Date(`${base}T${existing.check_in_time}`);
          const end = new Date(`${base}T${body.check_out_time}`);
          const rawMin = Math.round((end.getTime() - start.getTime()) / 60000);
          const breakMin = body.break_minutes ?? existing.break_minutes ?? 60;
          body.raw_hours_minutes = rawMin;
          body.break_minutes = breakMin;
          body.net_work_minutes = Math.max(0, rawMin - breakMin);

          // Fetch policy for overtime
          if (existing.policy_id) {
            const { data: pol } = await svcClient
              .from("work_policies")
              .select("net_work_hours_required, half_day_threshold_hours")
              .eq("id", existing.policy_id)
              .single();
            if (pol) {
              const reqNet = (pol.net_work_hours_required as number) * 60;
              body.overtime_minutes = Math.max(0, body.net_work_minutes - reqNet);
              if (body.net_work_minutes < (pol.half_day_threshold_hours as number) * 60) {
                body.status = "half_day";
              } else if (existing.late_minutes > 0) {
                body.status = "late";
              } else {
                body.status = "present";
              }
            }
          }
        }
      } else if (ctx.role === "company_admin") {
        if (existing.company_id !== ctx.companyId)
          return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });
        // Admin edits must include a reason
        if (!body.manual_reason)
          body.manual_reason = "Admin correction";
        body.is_manual_entry = true;
      }

      const { data, error } = await svcClient
        .from("attendance")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "UPDATE_ATTENDANCE", "attendance", resourceId, body);
      return successRes("Attendance updated", data);
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "attendance");
  }
});
