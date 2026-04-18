import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  logAction,
} from "../_shared/auth.ts";

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", "profile"].includes(segments[0])
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

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { error: "Unauthorized" });
  
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const targetUserId = (segments[0] && segments[0] !== "") ? segments[0] : ctx.userId;

  // Security: Only self or Admin can view/update
  if (targetUserId !== ctx.userId && ctx.role !== "admin") {
     return jsonRes(403, { error: "Forbidden: Cannot access other user profile" });
  }

  try {
    if (method === "GET") {
      const { data, error } = await adminClient
        .from("profiles")
        .select("*, companies(name), employees(*)")
        .eq("user_id", targetUserId)
        .single();
      if (error) throw error;
      return jsonRes(200, { data });
    }

    if (method === "PATCH") {
      const body = await req.json();
      
      // Restriction: Non-admins cannot change role or company_id
      if (ctx.role !== "admin") {
          delete body.role;
          delete body.company_id;
      }

      const { data, error } = await adminClient
        .from("profiles")
        .update(body)
        .eq("user_id", targetUserId)
        .select()
        .single();
      if (error) throw error;

      await logAction(adminClient, ctx, "UPDATE_PROFILE", "profiles", targetUserId, body);
      return jsonRes(200, { data });
    }

    return jsonRes(404, { error: "Resource not found" });
  } catch (err: any) {
    return jsonRes(400, { error: err.message });
  }
});
