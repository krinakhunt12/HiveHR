import { SupabaseClient, createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export interface UserContext {
  userId: string;
  role: "admin" | "company_admin" | "employee";
  companyId: string | null;
  employeeId: string | null;
}

/**
 * Resolves the authenticated user's context from the DB.
 */
export async function getUserContext(
  req: Request
): Promise<UserContext | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  
  const authClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);

  if (userError || !user) return null;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  // Fetch profile to get role and company_id
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, company_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    console.error("DEBUG: Profile NOT FOUND for user_id:", user.id);
    return null;
  }

  // If employee, get employeeId
  let employeeId: string | null = null;
  if (profile.role === "employee") {
    const { data: employee } = await adminClient
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(); // Fix: Use maybeSingle to avoid throw on empty
    
    if (!employee) {
        console.error("DEBUG: Employee record NOT FOUND in 'employees' table for user_id:", user.id);
    }
    employeeId = employee?.id || null;
  }

  return {
    userId: user.id,
    role: profile.role as UserContext["role"],
    companyId: profile.company_id,
    employeeId,
  };
}

/**
 * Logs an action to the system_logs table for auditing.
 */
export async function logAction(
  supabase: SupabaseClient,
  ctx: UserContext,
  action: string,
  resource: string,
  targetId?: string,
  details?: any
) {
  try {
    await supabase.from("system_logs").insert({
      actor_id: ctx.userId,
      company_id: ctx.companyId,
      action,
      resource,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to log action:", err);
  }
}

/** Convenience: return JSON responses */
export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Authorization, authorization, x-client-info, apikey, x-api-key, content-type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}

export function unauthorized(): Response {
  return jsonResponse(401, { error: "Unauthorized" });
}

export function forbidden(): Response {
  return jsonResponse(403, { error: "Forbidden" });
}

export function badRequest(error: string): Response {
  return jsonResponse(400, { error });
}
