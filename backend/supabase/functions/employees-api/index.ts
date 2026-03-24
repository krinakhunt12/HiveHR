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

function getPathSegments(pathname: string): string[] {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

function normalizePath(pathname: string): string {
  const segments = getPathSegments(pathname);

  if (segments[0] === "functions" && segments[1] === "v1") {
    segments.splice(0, 2);
  }

  if (segments[0] === "employees-api") {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
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
  const normalizedPath = normalizePath(url.pathname);
  const segments = getPathSegments(normalizedPath);
  const incomingAuth = req.headers.get("Authorization") ?? null;
  const incomingApiKey = req.headers.get("apikey") ?? req.headers.get("x-api-key") ?? null;
  try { console.log("employees-api -> incoming Authorization:", incomingAuth ? `${incomingAuth.slice(0, 20)}...` : null, "apikey:", incomingApiKey ? "present" : "missing"); } catch {}

  if (!incomingAuth) {
    return jsonResponse(401, { error: "Missing Authorization header" });
  }

  try {
    if (req.method === "GET" && normalizedPath === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "employees-api",
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === "GET" && normalizedPath === "/employees") {
      const companyId = url.searchParams.get("company_id");

      let query = supabase
        .from("employees")
        .select("id, employee_code, full_name, designation, joined_on, status, company_id, department_id")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;

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

    return jsonResponse(404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
