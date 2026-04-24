import {
  SupabaseClient,
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2.39.0";

export interface UserContext {
  userId: string;
  role: "super_admin" | "company_admin" | "employee";
  companyId: string | null;
  employeeId: string | null;
  fullName: string;
}

/**
 * Resolves the authenticated user's context (role, company, employee record)
 * from the bearer token in the Authorization header.
 * Uses service_role to bypass RLS for profile lookups.
 */
export async function getUserContext(
  req: Request
): Promise<UserContext | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  // Verify the JWT via the auth server
  const authClient = createClient(supabaseUrl, anonKey);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);
  if (userError || !user) return null;

  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, company_id, full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[auth] profile not found for user_id:", user.id);
    return null;
  }

  // Resolve employee record for all non-super_admin roles
  let employeeId: string | null = null;
  if (profile.role !== "super_admin" && profile.company_id) {
    const { data: emp } = await adminClient
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .eq("company_id", profile.company_id)
      .maybeSingle();

    if (!emp && profile.role === "employee") {
      console.error("[auth] employee record not found for user_id:", user.id);
    }
    employeeId = emp?.id ?? null;
  }

  return {
    userId: user.id,
    role: profile.role as UserContext["role"],
    companyId: profile.company_id ?? null,
    employeeId,
    fullName: profile.full_name ?? "",
  };
}

/**
 * Writes a structured entry to system_logs for auditing.
 * Never throws — audit failure must not break business logic.
 */
export async function logAction(
  supabase: SupabaseClient,
  ctx: UserContext,
  action: string,
  resource: string,
  targetId?: string,
  details?: unknown
): Promise<void> {
  try {
    await supabase.from("system_logs").insert({
      actor_id: ctx.userId,
      company_id: ctx.companyId,
      action,
      resource,
      target_id: targetId ?? null,
      details: details ?? null,
    });
  } catch (err) {
    console.error("[logAction] failed:", err);
  }
}

/** Build a service-role Supabase client (bypasses all RLS) */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

/** Build an anon Supabase client (respects RLS) */
export function anonClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
}
