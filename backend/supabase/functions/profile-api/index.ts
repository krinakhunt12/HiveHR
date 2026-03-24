import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

  if (segments[0] === "profile-api") {
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

  try {
    if (req.method === "GET" && normalizedPath === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "profile-api",
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

    return jsonResponse(404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
