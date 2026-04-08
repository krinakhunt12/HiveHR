import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface UserContext {
  userId: string;
  role: "admin" | "company_admin" | "hr" | "employee" | null;
  companyId: string | null;
  employeeId: string | null;
}

export async function getUserContext(supabase: SupabaseClient): Promise<UserContext | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Get role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get company_id from employees or company_memberships
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let companyId = employee?.company_id ?? null;
  
  if (!companyId) {
    const { data: membership } = await supabase
        .from("company_memberships")
        .select("company_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
    companyId = membership?.company_id ?? null;
  }

  return {
    userId: user.id,
    role: (profile?.role as any) ?? null,
    companyId,
    employeeId: employee?.id ?? null,
  };
}
