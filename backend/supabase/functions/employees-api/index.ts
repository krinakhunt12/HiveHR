import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getUserContext } from "../_shared/auth.ts";

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

    const userContext = await getUserContext(supabase);
    if (!userContext) {
      return jsonResponse(401, { error: "User context not found" });
    }

    if (req.method === "GET" && normalizedPath === "/employees") {
      const companyIdParam = url.searchParams.get("company_id");

      let query = supabase
        .from("employees")
        .select("id, employee_code, full_name, designation, joined_on, status, company_id, department_id")
        .order("created_at", { ascending: false });

      // Role-based filtering
      if (userContext.role === "admin") {
        // Admin can see all or filter by param
        if (companyIdParam) {
          query = query.eq("company_id", companyIdParam);
        }
      } else {
        // HR and Employee can ONLY see their own company
        if (!userContext.companyId) {
          return jsonResponse(403, { error: "User is not associated with a company" });
        }
        query = query.eq("company_id", userContext.companyId);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse(400, { error: error.message });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "GET" && segments[0] === "employees" && segments.length === 2) {
      const employeeId = segments[1];

      let query = supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId);

      // Role-based filtering for single employee access
      if (userContext.role !== "admin") {
        if (!userContext.companyId) {
          return jsonResponse(403, { error: "User is not associated with a company" });
        }
        query = query.eq("company_id", userContext.companyId);
      }

      const { data, error } = await query.single();

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

      // Role-based validation
      if (userContext.role !== "admin") {
        if (!userContext.companyId || userContext.role !== "hr") {
          return jsonResponse(403, { error: "Insufficient permissions" });
        }
        if (payload.company_id !== userContext.companyId) {
          return jsonResponse(403, { error: "You can only create employees for your own company" });
        }
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

      // Role-based validation
      if (userContext.role !== "admin") {
        if (!userContext.companyId || userContext.role !== "hr") {
          return jsonResponse(403, { error: "Insufficient permissions" });
        }
        
        // Verify employee belongs to your company
        const { data: existing, error: checkError } = await supabase
          .from("employees")
          .select("company_id")
          .eq("id", employeeId)
          .single();
        
        if (checkError || existing?.company_id !== userContext.companyId) {
          return jsonResponse(403, { error: "You can only update employees from your own company" });
        }
      }

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

      // Role-based validation
      if (userContext.role !== "admin") {
        if (!userContext.companyId || userContext.role !== "hr") {
          return jsonResponse(403, { error: "Insufficient permissions" });
        }
        
        // Verify employee belongs to your company
        const { data: existing, error: checkError } = await supabase
          .from("employees")
          .select("company_id")
          .eq("id", employeeId)
          .single();
        
        if (checkError || existing?.company_id !== userContext.companyId) {
          return jsonResponse(403, { error: "You can only delete employees from your own company" });
        }
      }

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
