/**
 * Profile Edge Function — /functions/v1/profile
 *
 * GET    /         — get own profile
 * PATCH  /         — update own profile (limited fields)
 * GET    /:id      — admin: get any user's profile
 * PATCH  /:id      — admin: update any user's profile
 *
 * verify_jwt = true
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import { getUserContext, jsonResponse, unauthorized, forbidden } from "../_shared/auth.ts";

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (segments.length > 0 && ["functions", "v1", "profile"].includes(segments[0])) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();

  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  // Extract optional /:id from path
  const pathId = path === "/" ? null : path.replace(/^\//, "");

  try {
    /* ── GET /profile  or  GET /profile/:id ── */
    if (method === "GET") {
      const targetId = pathId ?? ctx.userId;

      // Non-admins can only read their own profile
      if (targetId !== ctx.userId && ctx.role !== "admin" && ctx.role !== "company_admin") {
        return forbidden();
      }

      const { data, error } = await adminClient
        .from("profiles")
        .select("user_id, full_name, role, company_id, created_at, updated_at, companies(id, name)")
        .eq("user_id", targetId)
        .single();

      if (error) throw error;
      return jsonResponse(200, data);
    }

    /* ── PATCH /profile  or  PATCH /profile/:id ── */
    if (method === "PATCH") {
      const targetId = pathId ?? ctx.userId;
      const body = await req.json().catch(() => ({}));

      // Non-admins can only update their own profile and only safe fields
      if (targetId !== ctx.userId && ctx.role !== "admin") {
        return forbidden();
      }

      // Allowed fields per role
      const adminFields = ["full_name", "role", "company_id"];
      const employeeFields = ["full_name"];
      const allowedFields = ctx.role === "admin" ? adminFields : employeeFields;

      const updatePayload: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) updatePayload[field] = body[field];
      }

      if (Object.keys(updatePayload).length === 0) {
        return jsonResponse(400, { error: "No updatable fields provided" });
      }

      const { data, error } = await adminClient
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", targetId)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse(200, { message: "Profile updated", data });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});