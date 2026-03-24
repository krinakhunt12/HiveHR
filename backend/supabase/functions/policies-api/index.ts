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

  if (segments[0] === "policies-api") {
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
  try { console.log("policies-api -> incoming Authorization:", incomingAuth ? `${incomingAuth.slice(0, 20)}...` : null, "apikey:", incomingApiKey ? "present" : "missing"); } catch {}

  if (!incomingAuth) {
    return jsonResponse(401, { error: "Missing Authorization header" });
  }
  const segments = getPathSegments(normalizedPath);

  try {
    if (req.method === "GET" && normalizedPath === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "policies-api",
        timestamp: new Date().toISOString(),
      });
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
