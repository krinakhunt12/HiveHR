/**
 * /functions/v1/documents
 *
 * Informational Company Policies (HR Rules, Code of Conduct, etc.)
 *
 * GET    /           — list active policies for company (all roles)
 * GET    /:id        — policy detail (all roles)
 * POST   /:id/acknowledge — acknowledge a policy (employee)
 * POST   /           — create policy (company_admin only)
 * PUT    /:id        — update policy (company_admin only)
 * DELETE /:id        — delete policy (company_admin only)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getUserContext, logAction } from "../_shared/auth.ts";
import {
  jsonRes,
  successRes,
  createdRes,
  errorRes,
  normalizePath,
  handleOptions,
} from "../_shared/responses.ts";

Deno.serve(async (req: Request) => {
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  try {
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ctx = await getUserContext(req);
    if (!ctx) return jsonRes(401, { success: false, code: "UNAUTHORIZED", message: "Unauthorized" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "documents");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resourceId = segments[0] && segments[0] !== "" ? segments[0] : null;
    const subAction = segments[1] || null;

    const companyId = ctx.companyId;
    if (!companyId)
      return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

    // ═══════════════════════════════════════════════════════
    // GET / — list policies
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && !resourceId) {
      const { data, error } = await svcClient
        .from("company_policies")
        .select(`
          *,
          acknowledgements:policy_acknowledgements(count)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return successRes("Policies fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // GET /:id — detail
    // ═══════════════════════════════════════════════════════
    if (method === "GET" && resourceId && !subAction) {
      const { data, error } = await svcClient
        .from("company_policies")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (error) throw error;
      if (data.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      return successRes("Policy detail fetched", data);
    }

    // ═══════════════════════════════════════════════════════
    // POST /:id/acknowledge — Acknowledge a policy (all roles)
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && resourceId && subAction === "acknowledge") {
      // 1. Verify policy exists and belongs to company
      const { data: policy, error: policyErr } = await svcClient
        .from("company_policies")
        .select("id, company_id")
        .eq("id", resourceId)
        .single();
      
      if (policyErr || !policy) 
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Policy not found" });
      
      if (policy.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      // 2. Resolve employee_id from user_id and company_id (fresh lookup)
      const { data: empRecord, error: empError } = await svcClient
        .from("employees")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (empError) throw empError;
      
      if (!empRecord) {
        return jsonRes(400, {
          success: false,
          code: "BAD_REQUEST",
          message: "No employee record found for acknowledgement. Only registered employees can acknowledge policies.",
        });
      }

      // 3. Perform acknowledgement
      const { error: ackError } = await svcClient
        .from("policy_acknowledgements")
        .upsert({
          policy_id: resourceId,
          employee_id: empRecord.id,
          acknowledged_at: new Date().toISOString(),
        }, { onConflict: "policy_id,employee_id" });

      if (ackError) throw ackError;
      
      await logAction(svcClient, ctx, "ACKNOWLEDGE_POLICY", "company_policies", resourceId, { employee_id: empRecord.id });
      return successRes("Policy acknowledged successfully");
    }

    // ── Writes (create/update/delete) require company_admin ──
    if (method !== "GET" && ctx.role === "employee") {
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });
    }

    // ═══════════════════════════════════════════════════════
    // POST / — Create policy
    // ═══════════════════════════════════════════════════════
    if (method === "POST" && !resourceId) {
      const body = await req.json();

      // Strip protected fields
      delete body.id;
      delete body.company_id;
      delete body.created_at;
      delete body.updated_at;

      const { data, error } = await svcClient
        .from("company_policies")
        .insert({ ...body, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      await logAction(svcClient, ctx, "CREATE_POLICY_DOC", "company_policies", data.id, body);
      return createdRes("Policy created", data);
    }

    // ═══════════════════════════════════════════════════════
    // PUT /:id — Update policy
    // ═══════════════════════════════════════════════════════
    if (method === "PUT" && resourceId) {
      const body = await req.json();

      delete body.id;
      delete body.company_id;
      delete body.created_at;

      const { data, error } = await svcClient
        .from("company_policies")
        .update(body)
        .eq("id", resourceId)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) throw error;
      await logAction(svcClient, ctx, "UPDATE_POLICY_DOC", "company_policies", resourceId, body);
      return successRes("Policy updated", data);
    }

    // ═══════════════════════════════════════════════════════
    // DELETE /:id — Delete policy
    // ═══════════════════════════════════════════════════════
    if (method === "DELETE" && resourceId) {
      // Verify ownership before deletion
      const { data: existing } = await svcClient
        .from("company_policies")
        .select("id, company_id")
        .eq("id", resourceId)
        .single();

      if (!existing)
        return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Policy not found" });
      if (existing.company_id !== companyId)
        return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Forbidden" });

      const { error } = await svcClient
        .from("company_policies")
        .delete()
        .eq("id", resourceId)
        .eq("company_id", companyId);

      if (error) throw error;
      await logAction(svcClient, ctx, "DELETE_POLICY_DOC", "company_policies", resourceId, {});
      return successRes("Policy deleted");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "documents");
  }
});
