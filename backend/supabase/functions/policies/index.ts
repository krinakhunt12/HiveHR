/**
 * Policies Edge Function — /functions/v1/policies
 *
 * GET    /          — list active policies (employee: own company; admin: all)
 * POST   /          — create policy (company_admin / admin)
 * GET    /:id       — get single policy
 * PATCH  /:id       — update policy (company_admin / admin)
 * DELETE /:id       — deactivate (soft delete) policy
 *
 * verify_jwt = true
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getUserContext,
  jsonResponse,
  unauthorized,
  forbidden,
} from "../_shared/auth.ts";

function normalizePath(pathname: string): string {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  while (
    segments.length > 0 &&
    ["functions", "v1", "policies"].includes(segments[0])
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

  const ctx = await getUserContext(req);
  if (!ctx) return unauthorized();

  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const method = req.method;

  const pathSegments = path.replace(/^\//, "").split("/");
  const resourceId = pathSegments[0] || null;

  const isAdminOrCompanyAdmin =
    ctx.role === "admin" || ctx.role === "company_admin";
  const companyId = ctx.companyId;

  try {
    /* ── GET / — List policies ── */
    if (method === "GET" && !resourceId) {
      const urlCompanyId = isAdminOrCompanyAdmin ? (url.searchParams.get("company_id") ?? companyId) : companyId;
      const policyType = url.searchParams.get("type");
      const showInactive = url.searchParams.get("include_inactive") === "true";
      const page = parseInt(url.searchParams.get("page") ?? "1");
      const limit = parseInt(url.searchParams.get("limit") ?? "20");
      const offset = (page - 1) * limit;

      if (!urlCompanyId) {
          return jsonResponse(400, { error: "company_id is required" });
      }

      let query = adminClient
        .from("company_policies")
        .select("*", { count: "exact" })
        .eq("company_id", urlCompanyId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Employees only see active policies
      if (!isAdminOrCompanyAdmin || !showInactive) {
        query = query.eq("is_active", true);
      }

      if (policyType) query = query.eq("policy_type", policyType);

      const { data, error, count } = await query;
      if (error) throw error;

      return jsonResponse(200, {
        data,
        pagination: { page, limit, total: count ?? 0 },
      });
    }

    /* ── GET /:id — Single policy ── */
    if (method === "GET" && resourceId) {
      const { data, error } = await adminClient
        .from("company_policies")
        .select("*")
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .single();

      if (error) throw error;

      // Employees can only view active policies
      if (!isAdminOrCompanyAdmin && !data.is_active) {
        return jsonResponse(404, { error: "Policy not found" });
      }

      return jsonResponse(200, data);
    }

    /* ── POST / — Create policy ── */
    if (method === "POST" && !resourceId) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const body = await req.json();
      const { title, policy_type, content, effective_from, company_id: bodyCompanyId } = body;

      if (!title || !content) {
        return jsonResponse(400, { error: "title and content are required" });
      }

      const targetCompanyId = isAdminOrCompanyAdmin ? (bodyCompanyId ?? companyId) : companyId;

      const { data, error } = await adminClient
        .from("company_policies")
        .insert({
          company_id: targetCompanyId,
          title,
          policy_type: policy_type ?? "general",
          content,
          effective_from: effective_from ?? null,
          is_active: true,
          created_by: ctx.userId,
        })
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(201, { message: "Policy created", data });
    }

    /* ── PATCH /:id — Update policy ── */
    if (method === "PATCH" && resourceId) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const body = await req.json();
      const allowed = ["title", "policy_type", "content", "effective_from", "is_active"];

      const updates: Record<string, unknown> = {};
      for (const field of allowed) {
        if (body[field] !== undefined) updates[field] = body[field];
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(400, { error: "No updatable fields provided" });
      }

      const { data, error } = await adminClient
        .from("company_policies")
        .update(updates)
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(200, { message: "Policy updated", data });
    }

    /* ── DELETE /:id — Soft deactivate policy ── */
    if (method === "DELETE" && resourceId) {
      if (!isAdminOrCompanyAdmin) return forbidden();

      const { data, error } = await adminClient
        .from("company_policies")
        .update({ is_active: false })
        .eq("id", resourceId)
        .eq("company_id", companyId!)
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(200, { message: "Policy deactivated", data });
    }

    return jsonResponse(405, { error: "Method not allowed" });
  } catch (err: any) {
    return jsonResponse(400, { error: err.message });
  }
});