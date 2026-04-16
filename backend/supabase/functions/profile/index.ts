import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  logAction,
  badRequest,
} from "../_shared/auth.ts";

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
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();
  
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const segments = path.replace(/^\//, "").split("/");
  const targetUserId = (segments[0] && segments[0] !== "") ? segments[0] : ctx.userId;

  // Security: Only self or Admin can view/update
  if (targetUserId !== ctx.userId && ctx.role !== "admin") {
     return jsonResponse(403, { error: "Forbidden: Cannot access other user profile" });
  }

  try {
    if (method === "GET") {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies(name), employees(*)")
        .eq("user_id", targetUserId)
        .single();
      if (error) throw error;
      return jsonResponse(200, { data });
    }

    if (method === "PATCH") {
      const body = await req.json();
      
      // Restriction: Non-admins cannot change role or company_id
      if (ctx.role !== "admin") {
          delete body.role;
          delete body.company_id;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(body)
        .eq("user_id", targetUserId)
        .select()
        .single();
      if (error) throw error;

      await logAction(supabase, ctx, "UPDATE_PROFILE", "profiles", targetUserId, body);
      return jsonResponse(200, { data });
    }

    return jsonResponse(404, { error: "Resource not found" });
  } catch (err: any) {
    return badRequest(err.message);
  }
});
