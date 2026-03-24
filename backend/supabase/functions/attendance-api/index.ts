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
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

function normalizePath(pathname: string): string {
  const segments = getPathSegments(pathname);

  if (segments[0] === "functions" && segments[1] === "v1") {
    segments.splice(0, 2);
  }

  if (segments[0] === "attendance-api") {
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
  const incomingAuth = req.headers.get("Authorization") ?? null;
  const incomingApiKey = req.headers.get("apikey") ?? req.headers.get("x-api-key") ?? null;
  try { console.log("attendance-api -> incoming Authorization:", incomingAuth ? `${incomingAuth.slice(0, 20)}...` : null, "apikey:", incomingApiKey ? "present" : "missing"); } catch {}

  if (!incomingAuth) {
    return jsonResponse(401, { error: "Missing Authorization header" });
  }
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  try {
    if (req.method === "GET" && normalizedPath === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "attendance-api",
        timestamp: new Date().toISOString(),
      });
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

    return jsonResponse(404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
