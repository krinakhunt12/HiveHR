/**
 * /functions/v1/tasks
 *
 * GET    /           — list tasks (scoped by company/employee)
 * POST   /           — create task (admin only)
 * PATCH  /:id        — update task (admin all, employee status only)
 * DELETE /:id        — delete task (admin only)
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

    const companyId = ctx.companyId;
    if (!companyId)
      return jsonRes(400, { success: false, code: "BAD_REQUEST", message: "No company associated with your account" });

    const url = new URL(req.url);
    const path = normalizePath(url.pathname, "tasks");
    const method = req.method;
    const segments = path.replace(/^\//, "").split("/");
    const resourceId = segments[0] && segments[0] !== "" ? segments[0] : null;

    // GET / — list tasks
    if (method === "GET" && !resourceId) {
      let query = svcClient
        .from("tasks")
        .select("*, assigned_to_employee:employees(id, full_name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (ctx.role === "employee") {
        query = query.eq("assigned_to", ctx.employeeId);
      } else {
        // Optional filters for admin
        const status = url.searchParams.get("status");
        if (status) query = query.eq("status", status);
        const assignedTo = url.searchParams.get("assigned_to");
        if (assignedTo) query = query.eq("assigned_to", assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return successRes("Tasks fetched", data);
    }

    // PATCH /:id — update task
    if (method === "PATCH" && resourceId) {
      const body = await req.json();
      
      // Verification
      const { data: existing, error: fetchErr } = await svcClient
        .from("tasks")
        .select("*")
        .eq("id", resourceId)
        .eq("company_id", companyId)
        .single();
      
      if (fetchErr || !existing) return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Task not found" });

      if (ctx.role === "employee") {
        if (existing.assigned_to !== ctx.employeeId) {
          return jsonRes(403, { success: false, code: "FORBIDDEN", message: "You can only update tasks assigned to you" });
        }
        // Employees can ONLY update status
        const allowed = ["status"];
        const updates = Object.keys(body);
        if (updates.some(k => !allowed.includes(k))) {
          return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Employees can only update task status" });
        }
      }

      const { data, error } = await svcClient
        .from("tasks")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();
      
      if (error) throw error;
      await logAction(svcClient, ctx, "UPDATE_TASK", "tasks", resourceId, body);
      return successRes("Task updated", data);
    }

    // Write operations — company_admin only from here
    if (ctx.role === "employee")
      return jsonRes(403, { success: false, code: "FORBIDDEN", message: "Company Admin access required" });

    // POST / — create task
    if (method === "POST") {
      const body = await req.json();
      if (!body.title)
        return jsonRes(400, { success: false, code: "VALIDATION_ERROR", message: "title is required" });

      const { data, error } = await svcClient
        .from("tasks")
        .insert({
          company_id: companyId,
          created_by: ctx.userId,
          assigned_to: body.assigned_to || null,
          title: body.title,
          description: body.description || null,
          priority: body.priority || 'medium',
          status: body.status || 'pending',
          due_date: body.due_date || null
        })
        .select()
        .single();
      
      if (error) throw error;
      await logAction(svcClient, ctx, "CREATE_TASK", "tasks", data.id, body);
      return createdRes("Task created", data);
    }

    // DELETE /:id
    if (method === "DELETE" && resourceId) {
      const { error } = await svcClient
        .from("tasks")
        .delete()
        .eq("id", resourceId)
        .eq("company_id", companyId);
      
      if (error) throw error;
      await logAction(svcClient, ctx, "DELETE_TASK", "tasks", resourceId);
      return successRes("Task deleted");
    }

    return jsonRes(404, { success: false, code: "NOT_FOUND", message: "Resource not found" });
  } catch (err: unknown) {
    return errorRes(err, "tasks");
  }
});
