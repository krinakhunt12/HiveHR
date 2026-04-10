/**
 * Employee Edge Function — /functions/v1/employee
 *
 * GET    /                     — list employees for company (admin/company_admin)
 * GET    /:id                  — get single employee
 * POST   /                     — add new employee (company_admin/admin)
 * PATCH  /:id                  — update employee details
 * DELETE /:id                  — soft-delete (deactivate) employee
 * POST   /:id/reactivate       — reactivate employee
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
    ["functions", "v1", "employee"].includes(segments[0])
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

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  // Path parsing: /  |  /:id  |  /:id/reactivate
  const pathSegments = path.replace(/^\//, "").split("/");
  const resourceId = pathSegments[0] || null;
  const subAction = pathSegments[1] || null;

  const isAdminOrCompanyAdmin =
    ctx.role === "admin" || ctx.role === "company_admin";
  const companyId = ctx.companyId;

  try {
    /* ── GET / — List employees ── */
    if (method === "GET" && !resourceId) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const urlCompanyId =
        url.searchParams.get("company_id") ?? companyId;
      const department = url.searchParams.get("department_id");
      const status = url.searchParams.get("status");
      const search = url.searchParams.get("search");
      const page = parseInt(url.searchParams.get("page") ?? "1");
      const limit = parseInt(url.searchParams.get("limit") ?? "20");
      const offset = (page - 1) * limit;

      let query = adminClient
        .from("employees")
        .select(
          "*, departments(id, name), profiles!employees_profiles_user_id_fkey(user_id, role)",
          { count: "exact" }
        )
        .eq("company_id", urlCompanyId!)
        .range(offset, offset + limit - 1)
        .order("full_name");

      if (department) query = query.eq("department_id", department);
      if (status) query = query.eq("status", status);
      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,employee_code.ilike.%${search}%,designation.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return jsonResponse(200, {
        data,
        pagination: { page, limit, total: count ?? 0 },
      });
    }

    /* ── GET /:id — Single employee ── */
    if (method === "GET" && resourceId && !subAction) {
      // Employees can read their own record
      if (!isAdminOrCompanyAdmin && ctx.employeeId !== resourceId) {
        return forbidden();
      }

      const { data, error } = await adminClient
        .from("employees")
        .select("*, departments(id, name)")
        .eq("id", resourceId)
        .single();

      if (error) throw error;
      if (!isAdminOrCompanyAdmin && data.company_id !== companyId) {
        return forbidden();
      }

      return jsonResponse(200, data);
    }

    /* ── POST / — Add employee ── */
    if (method === "POST" && !resourceId) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const body = await req.json();
      const {
        email,
        password,
        full_name,
        employee_code,
        designation,
        department_id,
        employment_type,
        joined_on,
        salary,
      } = body;

      if (!email || !password || !full_name || !employee_code || !designation || !joined_on) {
        return jsonResponse(400, {
          error: "email, password, full_name, employee_code, designation, and joined_on are required",
        });
      }

      const targetCompanyId =
        ctx.role === "admin"
          ? (body.company_id ?? companyId)
          : companyId;

      // Create auth user
        const { data: newUser, error: createError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name,
              role: "employee",
              company_id: targetCompanyId,
              force_password_reset: true,
            },
            app_metadata: { role: "employee" },
          });
      if (createError) throw createError;

      const userId = newUser.user.id;

      // Upsert profile
      await adminClient.from("profiles").upsert(
        {
          user_id: userId,
          full_name,
          role: "employee",
          company_id: targetCompanyId,
        },
        { onConflict: "user_id" }
      );

      // Create employee record
      const { data: emp, error: empError } = await adminClient
        .from("employees")
        .insert({
          company_id: targetCompanyId,
          department_id: department_id ?? null,
          user_id: userId,
          employee_code,
          full_name,
          designation,
          employment_type: employment_type ?? "full_time",
          joined_on,
          salary: salary ?? null,
          status: "active",
        })
        .select()
        .single();

      if (empError) throw empError;

      // Add company membership
      await adminClient.from("company_memberships").upsert(
        {
          company_id: targetCompanyId,
          user_id: userId,
          role: "employee",
        },
        { onConflict: "company_id,user_id" }
      );

      return jsonResponse(201, {
        message: "Employee added successfully",
        data: emp,
      });
    }

    /* ── PATCH /:id — Update employee ── */
    if (method === "PATCH" && resourceId && !subAction) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const body = await req.json();
      const allowed = [
        "full_name",
        "designation",
        "department_id",
        "employment_type",
        "joined_on",
        "salary",
        "status",
        "employee_code",
      ];

      const updates: Record<string, unknown> = {};
      for (const field of allowed) {
        if (body[field] !== undefined) updates[field] = body[field];
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(400, { error: "No updatable fields provided" });
      }

      const { data, error } = await adminClient
        .from("employees")
        .update(updates)
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .select()
        .single();

      if (error) throw error;

      // Sync full_name to profile if changed
      if (updates.full_name && data.user_id) {
        await adminClient
          .from("profiles")
          .update({ full_name: updates.full_name })
          .eq("user_id", data.user_id);
      }

      return jsonResponse(200, { message: "Employee updated", data });
    }

    /* ── DELETE /:id — Soft deactivate ── */
    if (method === "DELETE" && resourceId && !subAction) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const { data: emp, error: fetchError } = await adminClient
        .from("employees")
        .select("user_id")
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .single();

      if (fetchError) throw fetchError;

      // Deactivate employee record
      const { data, error } = await adminClient
        .from("employees")
        .update({ status: "terminated" })
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .select()
        .single();

      if (error) throw error;

      // Ban user from auth so they can't login
      if (emp.user_id) {
        await adminClient.auth.admin.updateUserById(emp.user_id, {
          ban_duration: "876600h", // ~100 years
        });
      }

      return jsonResponse(200, { message: "Employee deactivated", data });
    }

    /* ── POST /:id/reactivate ── */
    if (method === "POST" && resourceId && subAction === "reactivate") {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const { data: emp, error: fetchError } = await adminClient
        .from("employees")
        .select("user_id")
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await adminClient
        .from("employees")
        .update({ status: "active" })
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .select()
        .single();

      if (error) throw error;

      // Unban user
      if (emp.user_id) {
        await adminClient.auth.admin.updateUserById(emp.user_id, {
          ban_duration: "none",
        });
      }

      return jsonResponse(200, { message: "Employee reactivated", data });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});