/**
 * /functions/v1/admin
 *
 * Accessible ONLY by super_admin role.
 * Super Admin CANNOT edit work policies — that is company_admin territory.
 *
 * GET    /companies            — list all companies
 * POST   /companies            — create a company
 * GET    /companies/:id        — company detail
 * PATCH  /companies/:id        — update (name, email, etc.)
 * PATCH  /companies/:id/plan   — change subscription plan
 * PATCH  /companies/:id/suspend — suspend company
 * PATCH  /companies/:id/activate — activate company
 * DELETE /companies/:id        — delete company
 *
 * GET    /plans                — list all plans
 * POST   /plans                — create plan
 * PUT    /plans/:id            — update plan
 * PATCH  /plans/:id/deactivate — deactivate plan
 *
 * GET    /users                — all platform users + profiles
 * PATCH  /users/:id            — update user role / company
 *
 * GET    /dashboard            — platform-wide stats
 * GET    /logs                 — system audit logs
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
    if (ctx.role !== "super_admin")
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Super Admin access required" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "admin");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resource = segments[0] || null;
    const resourceId = segments[1] || null;
    const subAction = segments[2] || null;

    // ═══════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════
    if (path === "/dashboard" && method === "GET") {
      const [
        { count: totalCompanies },
        { count: totalEmployees },
        { data: planDist },
        { data: recentCompanies },
        { data: expiringCompanies },
      ] = await Promise.all([
        svcClient.from("companies").select("*", { count: "exact", head: true }),
        svcClient.from("employees").select("*", { count: "exact", head: true }),
        svcClient
          .from("companies")
          .select("plan_id, plans(name)")
          .eq("plan_status", "active"),
        svcClient
          .from("companies")
          .select("id, name, plan_status, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        svcClient
          .from("companies")
          .select("id, name, plan_end_date, plan_status")
          .gte("plan_end_date", new Date().toISOString().slice(0, 10))
          .lte(
            "plan_end_date",
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10)
          ),
      ]);

      return successRes("Dashboard stats fetched", {
        total_companies: totalCompanies ?? 0,
        total_employees: totalEmployees ?? 0,
        plan_distribution: planDist ?? [],
        recent_signups: recentCompanies ?? [],
        expiring_subscriptions: expiringCompanies ?? [],
      });
    }

    // ═══════════════════════════════════════════════════════
    // COMPANIES
    // ═══════════════════════════════════════════════════════
    if (resource === "companies") {
      // List all companies
      if (method === "GET" && !resourceId) {
        const q = url.searchParams;
        let query = svcClient
          .from("companies")
          .select("*, plans(name, max_employees)")
          .order("created_at", { ascending: false });

        if (q.get("plan_status"))
          query = query.eq("plan_status", q.get("plan_status")!);
        if (q.get("plan_id"))
          query = query.eq("plan_id", q.get("plan_id")!);

        const { data, error } = await query;
        if (error) throw error;
        return successRes("Companies fetched", data);
      }

      // Get single company with employee/dept counts
      if (method === "GET" && resourceId && !subAction) {
        const { data, error } = await svcClient
          .from("companies")
          .select(`*, plans(*)`)
          .eq("id", resourceId)
          .single();
        if (error) throw error;

        const { count: empCount } = await svcClient
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("company_id", resourceId)
          .eq("status", "active");

        const { count: deptCount } = await svcClient
          .from("departments")
          .select("*", { count: "exact", head: true })
          .eq("company_id", resourceId);

        return successRes("Company detail fetched", {
          ...data,
          employee_count: empCount ?? 0,
          department_count: deptCount ?? 0,
        });
      }

      // Create company
      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await svcClient
          .from("companies")
          .insert({ ...body, created_by: ctx.userId })
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "CREATE_COMPANY", "companies", data.id, body);
        return createdRes("Company created", data);
      }

      // Update company
      if (method === "PATCH" && resourceId && !subAction) {
        const body = await req.json();
        delete body.id;
        const { data, error } = await svcClient
          .from("companies")
          .update(body)
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "UPDATE_COMPANY", "companies", resourceId, body);
        return successRes("Company updated", data);
      }

      // Change plan
      if (method === "PATCH" && resourceId && subAction === "plan") {
        const { plan_id, reason } = await req.json();
        if (!plan_id)
          return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "plan_id is required" });

        const { data: old } = await svcClient
          .from("companies")
          .select("plan_id")
          .eq("id", resourceId)
          .single();

        const { data, error } = await svcClient
          .from("companies")
          .update({
            plan_id,
            plan_status: "active",
            plan_start_date: new Date().toISOString().slice(0, 10),
          })
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;

        // Audit plan change separately
        await svcClient.from("plan_change_logs").insert({
          company_id: resourceId,
          changed_by: ctx.userId,
          old_plan_id: old?.plan_id,
          new_plan_id: plan_id,
          reason,
        });
        await logAction(svcClient, ctx, "CHANGE_PLAN", "companies", resourceId, { plan_id, reason });
        return successRes("Company plan updated", data);
      }

      // Suspend company
      if (method === "PATCH" && resourceId && subAction === "suspend") {
        const { data, error } = await svcClient
          .from("companies")
          .update({ plan_status: "suspended", is_active: false })
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "SUSPEND_COMPANY", "companies", resourceId);
        return successRes("Company suspended", data);
      }

      // Activate company
      if (method === "PATCH" && resourceId && subAction === "activate") {
        const { data, error } = await svcClient
          .from("companies")
          .update({ plan_status: "active", is_active: true })
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "ACTIVATE_COMPANY", "companies", resourceId);
        return successRes("Company activated", data);
      }

      // Delete company
      if (method === "DELETE" && resourceId) {
        const { error } = await svcClient
          .from("companies")
          .delete()
          .eq("id", resourceId);
        if (error) throw error;
        await logAction(svcClient, ctx, "DELETE_COMPANY", "companies", resourceId);
        return successRes("Company deleted");
      }
    }

    // ═══════════════════════════════════════════════════════
    // PLANS
    // ═══════════════════════════════════════════════════════
    if (resource === "plans") {
      if (method === "GET" && !resourceId) {
        const { data, error } = await svcClient
          .from("plans")
          .select("*")
          .order("price_monthly");
        if (error) throw error;
        return successRes("Plans fetched", data);
      }

      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await svcClient
          .from("plans")
          .insert(body)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "CREATE_PLAN", "plans", data.id, body);
        return createdRes("Plan created", data);
      }

      if (method === "PUT" && resourceId) {
        const body = await req.json();
        delete body.id;
        const { data, error } = await svcClient
          .from("plans")
          .update(body)
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "UPDATE_PLAN", "plans", resourceId, body);
        return successRes("Plan updated", data);
      }

      if (method === "PATCH" && resourceId && subAction === "deactivate") {
        const { data, error } = await svcClient
          .from("plans")
          .update({ is_active: false })
          .eq("id", resourceId)
          .select()
          .single();
        if (error) throw error;
        await logAction(svcClient, ctx, "DEACTIVATE_PLAN", "plans", resourceId);
        return successRes("Plan deactivated", data);
      }
    }

    // ═══════════════════════════════════════════════════════
    // USERS (platform-wide)
    // ═══════════════════════════════════════════════════════
    if (resource === "users") {
      if (method === "GET" && !resourceId) {
        const { data, error } = await svcClient
          .from("profiles")
          .select("*, companies(name)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return successRes("Users fetched", data);
      }

      if (method === "PATCH" && resourceId) {
        const body = await req.json();
        const { role, company_id, full_name } = body;

        const { data, error } = await svcClient
          .from("profiles")
          .update({ role, company_id, full_name })
          .eq("user_id", resourceId)
          .select()
          .single();
        if (error) throw error;

        if (role) {
          await svcClient.auth.admin.updateUserById(resourceId, {
            app_metadata: { role },
            user_metadata: { role },
          });
        }
        await logAction(svcClient, ctx, "UPDATE_USER", "profiles", resourceId, body);
        return successRes("User updated", data);
      }
    }

    // ═══════════════════════════════════════════════════════
    // LOGS
    // ═══════════════════════════════════════════════════════
    if (resource === "logs" && method === "GET") {
      const { data, error } = await svcClient
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return successRes("Logs fetched", data);
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "admin");
  }
});
