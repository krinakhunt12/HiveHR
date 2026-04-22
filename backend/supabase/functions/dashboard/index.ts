/**
 * /functions/v1/dashboard
 *
 * Returns role-appropriate dashboard stats in a single call.
 *
 * GET /   — returns stats based on the caller's role:
 *           super_admin   → platform-wide stats
 *           company_admin → company-level stats
 *           employee      → personal summary
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  errorRes,
  corsHeaders,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  if (req.method !== "GET")
    return jsonRes(405, { success: false, code: "METHOD_NOT_ALLOWED", message: "GET only" });

  const svcClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

  try {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);

    // ═══════════════════════════════════════════════════════
    // SUPER ADMIN DASHBOARD
    // ═══════════════════════════════════════════════════════
    if (ctx.role === "super_admin") {
      const [
        { count: totalCompanies },
        { count: activeCompanies },
        { count: totalEmployees },
        { data: planDist },
        { data: recentCompanies },
        { data: expiringCompanies },
      ] = await Promise.all([
        svcClient.from("companies").select("*", { count: "exact", head: true }),
        svcClient.from("companies").select("*", { count: "exact", head: true }).eq("plan_status", "active"),
        svcClient.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
        svcClient.from("companies").select("plan_id, plans(name), plan_status"),
        svcClient
          .from("companies")
          .select("id, name, plan_status, created_at, plans(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        svcClient
          .from("companies")
          .select("id, name, plan_end_date, plan_status, plans(name)")
          .gte("plan_end_date", today)
          .lte("plan_end_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
          .eq("plan_status", "active")
          .order("plan_end_date"),
      ]);

      // Aggregate plan distribution
      const planCount: Record<string, number> = {};
      for (const c of planDist ?? []) {
        const planName = (c.plans as { name: string } | null)?.name ?? "No Plan";
        planCount[planName] = (planCount[planName] ?? 0) + 1;
      }

      return successRes("Super Admin dashboard fetched", {
        total_companies: totalCompanies ?? 0,
        active_companies: activeCompanies ?? 0,
        suspended_companies: (totalCompanies ?? 0) - (activeCompanies ?? 0),
        total_employees: totalEmployees ?? 0,
        plan_distribution: Object.entries(planCount).map(([name, count]) => ({ name, count })),
        recent_signups: recentCompanies ?? [],
        expiring_subscriptions: expiringCompanies ?? [],
      });
    }

    // ═══════════════════════════════════════════════════════
    // COMPANY ADMIN DASHBOARD
    // ═══════════════════════════════════════════════════════
    if (ctx.role === "company_admin") {
      const companyId = ctx.companyId!;

      const [
        { count: totalEmployees },
        { data: todayAttendance },
        { count: pendingLeaves },
        { data: overtimeThisWeek },
        { data: company },
      ] = await Promise.all([
        svcClient.from("employees").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
        svcClient.from("attendance").select("status, overtime_minutes, employee_id, employees(full_name)").eq("company_id", companyId).eq("date", today),
        svcClient.from("leave_requests").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "pending"),
        svcClient
          .from("attendance")
          .select("employee_id, overtime_minutes, employees(full_name)")
          .eq("company_id", companyId)
          .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
          .gt("overtime_minutes", 0),
        svcClient.from("companies").select("*, plans(name, max_employees)").eq("id", companyId).single(),
      ]);

      const present = (todayAttendance ?? []).filter((a) => ["present", "late", "wfh"].includes(a.status)).length;
      const absent = (todayAttendance ?? []).filter((a) => a.status === "absent").length;
      const onLeave = (todayAttendance ?? []).filter((a) => a.status === "on_leave").length;
      const late = (todayAttendance ?? []).filter((a) => a.status === "late").length;

      const maxEmployees = (company?.plans as { max_employees: number } | null)?.max_employees ?? -1;

      return successRes("Company Admin dashboard fetched", {
        total_employees: totalEmployees ?? 0,
        employee_limit: maxEmployees,
        present_today: present,
        absent_today: absent,
        on_leave_today: onLeave,
        late_arrivals_today: late,
        pending_leave_requests: pendingLeaves ?? 0,
        overtime_this_week: (overtimeThisWeek ?? []).length,
        company: company,
      });
    }

    // ═══════════════════════════════════════════════════════
    // EMPLOYEE DASHBOARD
    // ═══════════════════════════════════════════════════════
    if (ctx.role === "employee") {
      if (!ctx.employeeId)
        return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No employee record found" });

      const employeeId = ctx.employeeId;

      const [
        { data: todayRecord },
        { data: recentAttendance },
        { data: leaveBalances },
        { data: upcomingLeaves },
        { data: monthSummary },
      ] = await Promise.all([
        svcClient
          .from("attendance")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("date", today)
          .maybeSingle(),
        svcClient
          .from("attendance")
          .select("date, check_in_time, check_out_time, status, net_work_minutes")
          .eq("employee_id", employeeId)
          .order("date", { ascending: false })
          .limit(5),
        svcClient
          .from("leave_balances")
          .select("*, leave_types(name, is_paid)")
          .eq("employee_id", employeeId)
          .eq("year", new Date().getFullYear()),
        svcClient
          .from("leave_requests")
          .select("*, leave_types(name)")
          .eq("employee_id", employeeId)
          .eq("status", "approved")
          .gte("from_date", today)
          .order("from_date")
          .limit(5),
        svcClient
          .from("attendance")
          .select("status")
          .eq("employee_id", employeeId)
          .gte("date", `${currentMonth}-01`)
          .lte("date", `${currentMonth}-31`),
      ]);

      // Month stats
      const monthStats = { present: 0, absent: 0, late: 0, half_day: 0, on_leave: 0 };
      for (const row of monthSummary ?? []) {
        const s = row.status as keyof typeof monthStats;
        if (s in monthStats) (monthStats[s] as number)++;
      }

      const enrichedBalances = (leaveBalances ?? []).map((lb) => ({
        ...lb,
        available: lb.quota + lb.carry_forward - lb.taken - lb.pending,
      }));

      return successRes("Employee dashboard fetched", {
        today_attendance: todayRecord,
        recent_attendance: recentAttendance ?? [],
        leave_balances: enrichedBalances,
        upcoming_leaves: upcomingLeaves ?? [],
        month_summary: monthStats,
      });
    }

    return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "Unknown role" });
  } catch (err: unknown) {
    return errorRes(err, "dashboard");
  }
});
