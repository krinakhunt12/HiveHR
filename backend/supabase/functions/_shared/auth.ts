import { SupabaseClient, createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export interface UserContext {
  userId: string;
  role: "admin" | "company_admin" | "employee" | null;
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

  if (!authHeader) {
      console.error("getUserContext: No Authorization header found");
      return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Create a dedicated client for auth verification with the token passed explicitly
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
  });

  const { data: { user }, error: userError } = await authClient.auth.getUser(token);

  if (userError || !user) {
    console.error("getUserContext: supabase.auth.getUser(token) failed", userError?.message);
    return null;
  }

  // Use service_role to fetch context details to avoid RLS restrictions during resolution
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("getUserContext: Profile fetch error", profileError.message);
  }

  let companyId: string | null = profile?.company_id ?? null;
  let employeeId: string | null = null;

  const { data: employee, error: employeeError } = await adminClient
    .from("employees")
    .select("id, company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (employeeError) {
    console.error("getUserContext: Employee fetch error", employeeError.message);
  }

  if (employee) {
    employeeId = employee.id;
    companyId = companyId ?? employee.company_id;
  }

  if (!companyId) {
    const { data: membership } = await adminClient
      .from("company_memberships")
      .select("company_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    companyId = membership?.company_id ?? null;
  }

  return {
    userId: user.id,
    role: (profile?.role as UserContext["role"]) ?? null,
    companyId,
    employeeId,
  };
}

/** Convenience: return 400/401/403 JSON responses */
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