/**
 * Leave Edge Function — /functions/v1/leave
 *
 * GET    /                     — list leave requests (filtered by role)
 * POST   /                     — employee submits leave request
 * PATCH  /:id                  — admin approves/rejects | employee cancels
 * DELETE /:id                  — employee cancels pending request
 * GET    /summary              — per-employee leave summary for current year
 * GET    /calendar             — approved leaves in a date range
 *
 * verify_jwt = true
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  forbidden,
} from "../_shared/auth.ts";

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", "leave"].includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

/** Business days between two dates (Mon–Fri, naive) */
function businessDays(start: string, end: string): number {
  let count = 0;
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();

  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const pathSegments = path.replace(/^\//, "").split("/");
  const resourceId = pathSegments[0] || null;

  const isAdminOrCompanyAdmin =
    ctx.role === "admin" || ctx.role === "company_admin";
  const companyId = ctx.companyId;

  try {
    /* ── GET /summary — Leave balance summary ── */
    if (method === "GET" && resourceId === "summary") {
      const year =
        parseInt(url.searchParams.get("year") ?? "") || new Date().getFullYear();
      const employeeId = url.searchParams.get("employee_id");

      let query = adminClient
        .from("leave_requests")
        .select("employee_id, leave_type, status, start_date, end_date");

      if (!isAdminOrCompanyAdmin) {
        // Employee sees only their own
        const { data: emp } = await adminClient
          .from("employees")
          .select("id")
          .eq("user_id", ctx.userId)
          .single();
        if (!emp) return forbidden();
        query = query.eq("employee_id", emp.id);
      } else {
        // Admin optionally filters by employee
        if (employeeId) query = query.eq("employee_id", employeeId);
        // Scope to company via employees join — filter by company
      }

      query = query
        .gte("start_date", `${year}-01-01`)
        .lte("end_date", `${year}-12-31`)
        .eq("status", "approved");

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by leave_type
      const summary: Record<string, number> = {};
      for (const req of data ?? []) {
        const days = businessDays(req.start_date, req.end_date);
        summary[req.leave_type] = (summary[req.leave_type] ?? 0) + days;
      }

      return jsonResponse(200, { year, summary });
    }

    /* ── GET /calendar — Approved leaves for calendar view ── */
    if (method === "GET" && resourceId === "calendar") {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      let query = adminClient
        .from("leave_requests")
        .select(
          "id, employee_id, leave_type, start_date, end_date, status, employees(full_name, designation)"
        )
        .eq("status", "approved");

      if (from) query = query.gte("start_date", from);
      if (to) query = query.lte("end_date", to);

      const { data, error } = await query.order("start_date");
      if (error) throw error;

      return jsonResponse(200, data);
    }

    /* ── GET / — List leave requests ── */
    if (method === "GET" && !resourceId) {
      const status = url.searchParams.get("status");
      const employeeId = url.searchParams.get("employee_id");
      const leaveType = url.searchParams.get("leave_type");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const page = parseInt(url.searchParams.get("page") ?? "1");
      const limit = parseInt(url.searchParams.get("limit") ?? "20");
      const offset = (page - 1) * limit;

      let query = adminClient
        .from("leave_requests")
        .select(
          "*, employees!leave_requests_employee_id_fkey(id, full_name, designation, company_id)",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!isAdminOrCompanyAdmin) {
        // Employee: only their own
        if (!ctx.employeeId)
          return jsonResponse(404, { error: "Employee record not found" });
        query = query.eq("employee_id", ctx.employeeId);
      } else {
        // Admin: filter by employeeId optionally; scope to company
        if (employeeId) query = query.eq("employee_id", employeeId);
      }

      if (status) query = query.eq("status", status);
      if (leaveType) query = query.eq("leave_type", leaveType);
      if (from) query = query.gte("start_date", from);
      if (to) query = query.lte("end_date", to);

      const { data, error, count } = await query;
      if (error) throw error;

      // Filter to company scope for company_admin
      const filtered = isAdminOrCompanyAdmin
        ? (data ?? []).filter(
            (r: any) => r.employees?.company_id === companyId
          )
        : data;

      return jsonResponse(200, {
        data: filtered,
        pagination: { page, limit, total: count ?? 0 },
      });
    }

    /* ── POST / — Submit leave request ── */
    if (method === "POST" && !resourceId) {
      const body = await req.json();
      const { start_date, end_date, leave_type, reason, employee_id } = body;

      if (!start_date || !end_date || !leave_type) {
        return jsonResponse(400, {
          error: "start_date, end_date, and leave_type are required",
        });
      }

      if (new Date(end_date) < new Date(start_date)) {
        return jsonResponse(400, { error: "end_date must be >= start_date" });
      }

      // Determine target employee_id
      let targetEmployeeId = employee_id;
      if (!isAdminOrCompanyAdmin) {
        // Employee always submits for themselves
        if (!ctx.employeeId)
          return jsonResponse(404, { error: "Employee record not found" });
        targetEmployeeId = ctx.employeeId;
      }

      // Check for overlapping pending/approved requests
      const { data: overlapping } = await adminClient
        .from("leave_requests")
        .select("id")
        .eq("employee_id", targetEmployeeId)
        .in("status", ["pending", "approved"])
        .lte("start_date", end_date)
        .gte("end_date", start_date);

      if (overlapping && overlapping.length > 0) {
        return jsonResponse(409, {
          error: "Overlapping leave request exists for the selected dates",
        });
      }

      const { data, error } = await adminClient
        .from("leave_requests")
        .insert({
          employee_id: targetEmployeeId,
          leave_type,
          reason: reason ?? null,
          start_date,
          end_date,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(201, {
        message: "Leave request submitted",
        data,
        days_requested: businessDays(start_date, end_date),
      });
    }

    /* ── PATCH /:id — Approve / Reject / Cancel ── */
    if (method === "PATCH" && resourceId) {
      const body = await req.json();
      const { status, admin_comment } = body;

      const validStatuses = ["approved", "rejected", "cancelled"];
      if (!status || !validStatuses.includes(status)) {
        return jsonResponse(400, {
          error: `status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      // Fetch existing request
      const { data: existing, error: fetchErr } = await adminClient
        .from("leave_requests")
        .select("*, employees(user_id, company_id)")
        .eq("id", resourceId)
        .single();

      if (fetchErr || !existing)
        return jsonResponse(404, { error: "Leave request not found" });

      // Permission check
      if (status === "cancelled") {
        // Only the owning employee or admin can cancel
        const isOwner = existing.employees?.user_id === ctx.userId;
        if (!isOwner && !isAdminOrCompanyAdmin) return forbidden();
        if (existing.status !== "pending") {
          return jsonResponse(409, { error: "Only pending requests can be cancelled" });
        }
      } else {
        // approve/reject: admin only
        if (!isAdminOrCompanyAdmin) return forbidden();
        // Company scope check
        if (
          ctx.role === "company_admin" &&
          existing.employees?.company_id !== companyId
        ) {
          return forbidden();
        }
        if (existing.status !== "pending") {
          return jsonResponse(409, { error: "Only pending requests can be reviewed" });
        }
      }

      const updatePayload: Record<string, unknown> = {
        status,
        admin_comment: admin_comment ?? null,
      };

      if (status === "approved" || status === "rejected") {
        updatePayload.reviewed_by = ctx.userId;
        updatePayload.reviewed_at = new Date().toISOString();
      }

      const { data, error } = await adminClient
        .from("leave_requests")
        .update(updatePayload)
        .eq("id", resourceId)
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(200, {
        message: `Leave request ${status}`,
        data,
      });
    }

    /* ── DELETE /:id — Cancel request ── */
    if (method === "DELETE" && resourceId) {
      // Convenience alias — sets status to cancelled
      const { data: existing, error: fetchErr } = await adminClient
        .from("leave_requests")
        .select("*, employees(user_id)")
        .eq("id", resourceId)
        .single();

      if (fetchErr || !existing)
        return jsonResponse(404, { error: "Leave request not found" });

      const isOwner = existing.employees?.user_id === ctx.userId;
      if (!isOwner && !isAdminOrCompanyAdmin) return forbidden();

      if (existing.status !== "pending") {
        return jsonResponse(409, { error: "Only pending requests can be cancelled" });
      }

      const { data, error } = await adminClient
        .from("leave_requests")
        .update({ status: "cancelled" })
        .eq("id", resourceId)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(200, { message: "Leave request cancelled", data });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});