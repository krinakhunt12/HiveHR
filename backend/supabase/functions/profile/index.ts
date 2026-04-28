/**
 * /functions/v1/profile
 *
 * GET    /           — get own profile (all roles)
 * PATCH  /           — update own profile (name, avatar, phone)
 * GET    /policy     — get own work policy
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
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
    if (!ctx)
      return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "profile");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const subPath = segments[0] || null;

    // ═══════════════════════════════════════════════════════
    // GET /policy — employee's assigned work policy
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && subPath === "policy") {
      if (!ctx.employeeId)
        return jsonRes(400, {
          success: false,
          code: "BAD_REQUEST",
          message: "No employee record found",
        });

      const { data: employee } = await svcClient
        .from("employees")
        .select("policy_id, department_id, company_id")
        .eq("id", ctx.employeeId)
        .single();

      let policyId = employee?.policy_id ?? null;

      // Fall back to company default policy
      if (!policyId && employee?.company_id) {
        const { data: defaultPolicy } = await svcClient
          .from("work_policies")
          .select("id")
          .eq("company_id", employee.company_id)
          .eq("is_default", true)
          .maybeSingle();
        policyId = defaultPolicy?.id ?? null;
      }

      if (!policyId)
        return jsonRes(404, {
          success: false,
          code: "NOT_FOUND",
          message: "No work policy assigned",
        });

      const { data, error } = await svcClient
        .from("work_policies")
        .select("*")
        .eq("id", policyId)
        .single();
      if (error) throw error;
      return successRes("Work policy fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // GET / — own profile
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !subPath) {
      // Fetch profile
      const { data: profile, error: profileErr } = await svcClient
        .from("profiles")
        .select("*")
        .eq("user_id", ctx.userId)
        .single();
      if (profileErr) throw profileErr;

      // Fetch company separately (safe — no risky nested join)
      let company = null;
      if (profile.company_id) {
        const { data: companyData } = await svcClient
          .from("companies")
          .select("id, name, plan_id, plan_status, plan_end_date")
          .eq("id", profile.company_id)
          .maybeSingle();
        company = companyData;

        // Fetch plan separately if company has one
        if (company?.plan_id) {
          const { data: planData } = await svcClient
            .from("plans")
            .select("id, name, max_employees, max_departments, max_leave_types")
            .eq("id", company.plan_id)
            .maybeSingle();
          company = { ...company, plan: planData };
        }
      }

      // Include employee record if applicable
      let employeeRecord = null;
      if (ctx.employeeId) {
        const { data: emp } = await svcClient
          .from("employees")
          .select("*")
          .eq("id", ctx.employeeId)
          .single();

        if (emp) {
          // Fetch related records separately to avoid join errors on old schema
          let department = null;
          if (emp.department_id) {
            const { data: dept } = await svcClient
              .from("departments")
              .select("id, name")
              .eq("id", emp.department_id)
              .maybeSingle();
            department = dept;
          }

          let designation = null;
          // Try designation_id FK first (new schema), fall back to text field
          if (emp.designation_id) {
            const { data: desig } = await svcClient
              .from("designations")
              .select("id, name")
              .eq("id", emp.designation_id)
              .maybeSingle();
            designation = desig;
          } else if (emp.designation) {
            designation = { name: emp.designation };
          }

          let policy = null;
          const resolvedPolicyId = emp.policy_id;
          if (resolvedPolicyId) {
            const { data: pol } = await svcClient
              .from("work_policies")
              .select("policy_name, shift_start, shift_end")
              .eq("id", resolvedPolicyId)
              .maybeSingle();
            policy = pol;
          }

          employeeRecord = {
            ...emp,
            // Normalize field names — handle both old (joined_on) and new (date_of_joining)
            date_of_joining: emp.date_of_joining ?? emp.joined_on ?? null,
            departments: department,
            designations: designation,
            work_policies: policy,
          };
        }
      }

      return successRes("Profile fetched", {
        ...profile,
        company,
        employee: employeeRecord,
      });
    }

    // ═══════════════════════════════════════════════════════
    // PATCH / — update own profile
    // ═══════════════════════════════════════════════════════
    if (method === "PATCH" && !subPath) {
      const body = await req.json();

      // Nobody can elevate themselves
      if (ctx.role !== "admin") {
        delete body.role;
        delete body.company_id;
      }
      delete body.user_id;

      const { data, error } = await svcClient
        .from("profiles")
        .update(body)
        .eq("user_id", ctx.userId)
        .select()
        .single();
      if (error) throw error;

      await logAction(svcClient, ctx, "UPDATE_PROFILE", "profiles", ctx.userId, body);
      return successRes("Profile updated", data);
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "profile");
  }
});