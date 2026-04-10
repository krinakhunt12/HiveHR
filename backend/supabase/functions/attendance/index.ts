/**
 * Attendance Edge Function — /functions/v1/attendance
 *
 * POST /check-in   — mark start of work day
 * POST /check-out  — mark end of work day
 * GET  /           — get today's attendance status
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
    ["functions", "v1", "attendance"].includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
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

  // Non-employees (admins who aren't assigned as employees) handle differently
  if (!ctx.employeeId) {
    return jsonResponse(400, { error: "User is not associated with an employee record" });
  }

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;
  const today = new Date().toISOString().split("T")[0];

  try {
    /* ── GET / — Get today's status ── */
    if (method === "GET" && path === "/") {
      const { data, error } = await adminClient
        .from("attendance_logs")
        .select("*")
        .eq("employee_id", ctx.employeeId)
        .eq("attendance_date", today)
        .maybeSingle();

      if (error) throw error;
      return jsonResponse(200, data || { status: "absent" });
    }

    /* ── POST /check-in ── */
    if (method === "POST" && path === "/check-in") {
      const { data, error } = await adminClient
        .from("attendance_logs")
        .upsert(
          {
            employee_id: ctx.employeeId,
            company_id: ctx.companyId,
            attendance_date: today,
            check_in_at: new Date().toISOString(),
          },
          { onConflict: "employee_id,attendance_date" }
        )
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(200, { message: "Checked in successfully", data });
    }

    /* ── POST /check-out ── */
    if (method === "POST" && path === "/check-out") {
      // Find existing log for today
      const { data: existing, error: fetchError } = await adminClient
        .from("attendance_logs")
        .select("*")
        .eq("employee_id", ctx.employeeId)
        .eq("attendance_date", today)
        .single();

      if (fetchError || !existing) {
        return jsonResponse(400, { error: "No check-in record found for today" });
      }

      if (existing.check_out_at) {
        return jsonResponse(400, { error: "Already checked out for today" });
      }

      const checkOutAt = new Date();
      const checkInAt = new Date(existing.check_in_at);
      const diffMs = checkOutAt.getTime() - checkInAt.getTime();
      const workMinutes = Math.round(diffMs / 60000);

      const { data, error } = await adminClient
        .from("attendance_logs")
        .update({
          check_out_at: checkOutAt.toISOString(),
          work_minutes: workMinutes,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(200, { message: "Checked out successfully", data });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});
