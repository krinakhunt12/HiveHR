import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type JsonMap = Record<string, unknown>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getString(payload: JsonMap, key: string): string | null {
  const value = payload[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getPathSegments(pathname: string): string[] {
  return pathname
    .replace(/^\/functions\/v1\/hr-api/, "")
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(500, {
      error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
        apikey: supabaseAnonKey,
      },
    },
  });

  const url = new URL(req.url);
  const normalizedPath = url.pathname
    .replace(/^\/functions\/v1\/hr-api/, "")
    .replace(/\/$/, "") || "/";
  const segments = getPathSegments(url.pathname);
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  try {
    if (req.method === "GET" && normalizedPath === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "hr-api",
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === "GET" && normalizedPath === "/me") {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return jsonResponse(401, {
          error: userError?.message ?? "Unauthorized",
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: employee } = await supabase
        .from("employees")
        .select("id, company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: membership } = await supabase
        .from("company_memberships")
        .select("company_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      const resolvedCompanyId = employee?.company_id ?? membership?.company_id ?? null;

      return jsonResponse(200, {
        data: {
          user_id: user.id,
          email: user.email ?? null,
          full_name: profile?.full_name ?? null,
          role: profile?.role ?? null,
          company_id: resolvedCompanyId,
          employee_id: employee?.id ?? null,
        },
      });
    }

    if (req.method === "GET" && normalizedPath === "/employees") {
      const companyId = url.searchParams.get("company_id");

      let query = supabase
        .from("employees")
        .select("id, employee_code, full_name, designation, joined_on, status, company_id, department_id");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "GET" && segments[0] === "employees" && segments.length === 2) {
      const employeeId = segments[1];

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (error) {
        return jsonResponse(404, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "POST" && normalizedPath === "/employees") {
      const payload = (await req.json()) as JsonMap;

      const required = ["company_id", "employee_code", "full_name", "designation", "joined_on"];
      const missing = required.filter((key) => payload[key] == null || payload[key] === "");

      if (missing.length > 0) {
        return jsonResponse(400, {
          error: `Missing required fields: ${missing.join(", ")}`,
        });
      }

      const { data, error } = await supabase
        .from("employees")
        .insert({
          company_id: payload.company_id,
          department_id: payload.department_id ?? null,
          user_id: payload.user_id ?? null,
          employee_code: payload.employee_code,
          full_name: payload.full_name,
          designation: payload.designation,
          employment_type: payload.employment_type ?? "full_time",
          joined_on: payload.joined_on,
          salary: payload.salary ?? null,
          status: payload.status ?? "active",
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(201, { data });
    }

    if (req.method === "PUT" && segments[0] === "employees" && segments.length === 2) {
      const employeeId = segments[1];
      const payload = (await req.json()) as JsonMap;

      const updateData = {
        company_id: payload.company_id ?? undefined,
        department_id: payload.department_id ?? undefined,
        user_id: payload.user_id ?? undefined,
        employee_code: payload.employee_code ?? undefined,
        full_name: payload.full_name ?? undefined,
        designation: payload.designation ?? undefined,
        employment_type: payload.employment_type ?? undefined,
        joined_on: payload.joined_on ?? undefined,
        salary: payload.salary ?? undefined,
        status: payload.status ?? undefined,
      };

      const { data, error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", employeeId)
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE" && segments[0] === "employees" && segments.length === 2) {
      const employeeId = segments[1];

      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { message: "Employee deleted" });
    }

    if (req.method === "GET" && normalizedPath === "/attendance") {
      const companyId = url.searchParams.get("company_id");
      const employeeId = url.searchParams.get("employee_id");
      const attendanceDate = url.searchParams.get("attendance_date");

      let query = supabase
        .from("attendance_logs")
        .select("*")
        .order("attendance_date", { ascending: false })
        .order("check_in_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      if (attendanceDate) {
        query = query.eq("attendance_date", attendanceDate);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "POST" && normalizedPath === "/attendance/check-in") {
      const payload = (await req.json()) as JsonMap;
      const employeeId = getString(payload, "employee_id");
      const companyId = getString(payload, "company_id");
      const attendanceDate = getString(payload, "attendance_date") ?? today;

      if (!employeeId || !companyId) {
        return jsonResponse(400, {
          error: "Missing required fields: employee_id, company_id",
        });
      }

      const { data: existing, error: existingError } = await supabase
        .from("attendance_logs")
        .select("id, check_in_at")
        .eq("employee_id", employeeId)
        .eq("attendance_date", attendanceDate)
        .maybeSingle();

      if (existingError) {
        return jsonResponse(400, { error: existingError.message });
      }

      if (existing?.check_in_at) {
        return jsonResponse(409, { error: "Employee already checked in for this date" });
      }

      if (existing?.id) {
        const { data, error } = await supabase
          .from("attendance_logs")
          .update({ check_in_at: nowIso })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          return jsonResponse(400, { error: error.message });
        }

        return jsonResponse(200, { data, message: "Checked in" });
      }

      const { data, error } = await supabase
        .from("attendance_logs")
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          attendance_date: attendanceDate,
          check_in_at: nowIso,
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(201, { data, message: "Checked in" });
    }

    if (req.method === "POST" && normalizedPath === "/attendance/check-out") {
      const payload = (await req.json()) as JsonMap;
      const employeeId = getString(payload, "employee_id");
      const attendanceDate = getString(payload, "attendance_date") ?? today;

      if (!employeeId) {
        return jsonResponse(400, {
          error: "Missing required field: employee_id",
        });
      }

      const { data: existing, error: existingError } = await supabase
        .from("attendance_logs")
        .select("id, check_in_at, check_out_at")
        .eq("employee_id", employeeId)
        .eq("attendance_date", attendanceDate)
        .maybeSingle();

      if (existingError) {
        return jsonResponse(400, { error: existingError.message });
      }

      if (!existing?.id || !existing.check_in_at) {
        return jsonResponse(400, {
          error: "Check-in record not found for this date",
        });
      }

      if (existing.check_out_at) {
        return jsonResponse(409, { error: "Employee already checked out for this date" });
      }

      const checkInMs = new Date(existing.check_in_at).getTime();
      const checkOutMs = new Date(nowIso).getTime();
      const workMinutes = Math.max(0, Math.floor((checkOutMs - checkInMs) / 60000));

      const { data, error } = await supabase
        .from("attendance_logs")
        .update({
          check_out_at: nowIso,
          work_minutes: workMinutes,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data, message: "Checked out" });
    }

    if (req.method === "GET" && normalizedPath === "/policies") {
      const companyId = url.searchParams.get("company_id");
      if (!companyId) {
        return jsonResponse(400, { error: "Missing query parameter: company_id" });
      }

      const { data, error } = await supabase
        .from("company_policies")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "POST" && normalizedPath === "/policies") {
      const payload = (await req.json()) as JsonMap;
      const companyId = getString(payload, "company_id");
      const title = getString(payload, "title");
      const content = getString(payload, "content");

      if (!companyId || !title || !content) {
        return jsonResponse(400, {
          error: "Missing required fields: company_id, title, content",
        });
      }

      const { data, error } = await supabase
        .from("company_policies")
        .insert({
          company_id: companyId,
          title,
          policy_type: getString(payload, "policy_type") ?? "general",
          content,
          effective_from: getString(payload, "effective_from") ?? null,
          is_active: typeof payload.is_active === "boolean" ? payload.is_active : true,
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(201, { data });
    }

    if (req.method === "PUT" && segments[0] === "policies" && segments.length === 2) {
      const policyId = segments[1];
      const payload = (await req.json()) as JsonMap;

      const { data, error } = await supabase
        .from("company_policies")
        .update({
          title: payload.title ?? undefined,
          policy_type: payload.policy_type ?? undefined,
          content: payload.content ?? undefined,
          effective_from: payload.effective_from ?? undefined,
          is_active: payload.is_active ?? undefined,
        })
        .eq("id", policyId)
        .select()
        .single();

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE" && segments[0] === "policies" && segments.length === 2) {
      const policyId = segments[1];

      const { error } = await supabase
        .from("company_policies")
        .delete()
        .eq("id", policyId);

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { message: "Policy deleted" });
    }

    return jsonResponse(404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
