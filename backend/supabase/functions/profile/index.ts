import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import { jsonRes, normalizePath, corsHeaders, errorRes } from "../_shared/responses.ts";

Deno.serve(async (req: any) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  const ctx = await getUserContext(req);
  if (!ctx) return jsonRes(401, { error: "Unauthorized" });
  
  const url    = new URL(req.url);
  const path   = normalizePath(url.pathname, "profile");
  const method = req.method;

  const segments   = path.replace(/^\//, "").split("/");
  const resource   = segments[0] || null;
  const resourceId = segments[1] || null;

  const targetUserId = resource || ctx.userId;

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
    return errorRes(err, "profile");
  }
});
