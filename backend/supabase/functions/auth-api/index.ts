import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type SignupRole = "admin" | "company_admin" | "employee";

type JsonMap = Record<string, unknown>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getString(payload: JsonMap, key: string): string | null {
  const value = payload[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRole(value: string | null): value is SignupRole {
  return value === "admin" || value === "company_admin" || value === "employee";
}

function getPathSegments(pathname: string): string[] {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

function normalizeAuthPath(pathname: string): string {
  const segments = getPathSegments(pathname);

  // Handle both gateway-style paths (/functions/v1/auth-api/signup)
  // and direct runtime paths (/auth-api/signup or /signup).
  if (segments[0] === "functions" && segments[1] === "v1") {
    segments.splice(0, 2);
  }

  if (segments[0] === "auth-api") {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

function dashboardPathForRole(role: SignupRole): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "company_admin") return "/dashboard/company";
  return "/dashboard/employee";
}

async function logAuthEvent(
  adminClient: ReturnType<typeof createClient>,
  payload: {
    user_id?: string | null;
    email?: string | null;
    action: "signup" | "login";
    role?: SignupRole | null;
    status: "success" | "failed";
    error_message?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  await adminClient.from("auth_activity_logs").insert({
    user_id: payload.user_id ?? null,
    email: payload.email ?? null,
    action: payload.action,
    role: payload.role ?? null,
    status: payload.status,
    error_message: payload.error_message ?? null,
    metadata: payload.metadata ?? {},
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, {
      error: "Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const publicClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const url = new URL(req.url);
  const path = normalizeAuthPath(url.pathname);

  try {
    if (req.method === "GET" && path === "/health") {
      return jsonResponse(200, {
        ok: true,
        service: "auth-api",
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === "POST" && path === "/signup") {
      const payload = (await req.json()) as JsonMap;

      const email = getString(payload, "email");
      const password = getString(payload, "password");
      const fullName = getString(payload, "full_name") ?? "";
      const roleValue = getString(payload, "role");

      if (!email || !password || !roleValue) {
        await logAuthEvent(adminClient, {
          email,
          action: "signup",
          status: "failed",
          error_message: "Missing required fields",
        });
        return jsonResponse(400, {
          error: "Missing required fields: email, password, role",
        });
      }

      if (!isRole(roleValue)) {
        await logAuthEvent(adminClient, {
          email,
          action: "signup",
          status: "failed",
          error_message: "Invalid role",
        });
        return jsonResponse(400, {
          error: "Invalid role. Allowed roles: admin, company_admin, employee",
        });
      }

      if (password.length < 8) {
        await logAuthEvent(adminClient, {
          email,
          action: "signup",
          role: roleValue,
          status: "failed",
          error_message: "Password too short",
        });
        return jsonResponse(400, { error: "Password must be at least 8 characters" });
      }

      const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: roleValue,
        },
      });

      if (createUserError || !createdUserData.user) {
        await logAuthEvent(adminClient, {
          email,
          action: "signup",
          role: roleValue,
          status: "failed",
          error_message: createUserError?.message ?? "Unable to create user",
        });
        return jsonResponse(400, {
          error: createUserError?.message ?? "Unable to create user",
        });
      }

      const userId = createdUserData.user.id;

      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
          user_id: userId,
          full_name: fullName,
          role: roleValue,
        });

      if (profileError) {
        await logAuthEvent(adminClient, {
          user_id: userId,
          email,
          action: "signup",
          role: roleValue,
          status: "failed",
          error_message: profileError.message,
        });
        return jsonResponse(400, { error: profileError.message });
      }

      let companyId: string | null = null;

      if (roleValue === "company_admin") {
        const companyName = getString(payload, "company_name");
        if (!companyName) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: "Missing company_name",
          });
          return jsonResponse(400, {
            error: "company_name is required for company_admin signup",
          });
        }

        const { data: company, error: companyError } = await adminClient
          .from("companies")
          .insert({
            name: companyName,
            legal_name: companyName,
            created_by: userId,
          })
          .select("id")
          .single();

        if (companyError) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: companyError.message,
          });
          return jsonResponse(400, { error: companyError.message });
        }

        companyId = company.id;

        const { error: membershipError } = await adminClient
          .from("company_memberships")
          .upsert({
            company_id: companyId,
            user_id: userId,
            role: "company_admin",
          });

        if (membershipError) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: membershipError.message,
          });
          return jsonResponse(400, { error: membershipError.message });
        }
      }

      if (roleValue === "employee") {
        const companyIdValue = getString(payload, "company_id");
        const employeeCode = getString(payload, "employee_code");
        const designation = getString(payload, "designation");
        const joinedOn = getString(payload, "joined_on") ?? new Date().toISOString().slice(0, 10);

        if (!companyIdValue || !employeeCode || !designation) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: "Missing employee signup fields",
          });
          return jsonResponse(400, {
            error: "company_id, employee_code and designation are required for employee signup",
          });
        }

        companyId = companyIdValue;

        const { error: employeeError } = await adminClient
          .from("employees")
          .insert({
            company_id: companyId,
            user_id: userId,
            employee_code: employeeCode,
            full_name: fullName || email,
            designation,
            joined_on: joinedOn,
            status: "active",
          });

        if (employeeError) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: employeeError.message,
          });
          return jsonResponse(400, { error: employeeError.message });
        }

        const { error: membershipError } = await adminClient
          .from("company_memberships")
          .upsert({
            company_id: companyId,
            user_id: userId,
            role: "employee",
          });

        if (membershipError) {
          await logAuthEvent(adminClient, {
            user_id: userId,
            email,
            action: "signup",
            role: roleValue,
            status: "failed",
            error_message: membershipError.message,
          });
          return jsonResponse(400, { error: membershipError.message });
        }
      }

      await logAuthEvent(adminClient, {
        user_id: userId,
        email,
        action: "signup",
        role: roleValue,
        status: "success",
        metadata: {
          company_id: companyId,
        },
      });

      return jsonResponse(201, {
        message: "Signup successful",
        user_id: userId,
        role: roleValue,
        company_id: companyId,
        redirect_to: dashboardPathForRole(roleValue),
      });
    }

    if (req.method === "POST" && path === "/login") {
      const payload = (await req.json()) as JsonMap;
      const email = getString(payload, "email");
      const password = getString(payload, "password");

      if (!email || !password) {
        await logAuthEvent(adminClient, {
          email,
          action: "login",
          status: "failed",
          error_message: "Missing login credentials",
        });
        return jsonResponse(400, {
          error: "Missing required fields: email, password",
        });
      }

      const { data: signInData, error: signInError } = await publicClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.user || !signInData.session) {
        await logAuthEvent(adminClient, {
          email,
          action: "login",
          status: "failed",
          error_message: signInError?.message ?? "Invalid credentials",
        });
        return jsonResponse(401, {
          error: signInError?.message ?? "Invalid credentials",
        });
      }

      const userId = signInData.user.id;

      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("role, full_name")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        await logAuthEvent(adminClient, {
          user_id: userId,
          email,
          action: "login",
          status: "failed",
          error_message: profileError.message,
        });
        return jsonResponse(400, { error: profileError.message });
      }

      const role = profile.role as SignupRole;

      await logAuthEvent(adminClient, {
        user_id: userId,
        email,
        action: "login",
        role,
        status: "success",
      });
      // Try to find a company mapping for this user (company_memberships or employees)
      let companyId: string | null = null;
      let companyName: string | null = null;

      const { data: membership } = await adminClient
        .from("company_memberships")
        .select("company_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (membership && (membership as any).company_id) {
        companyId = (membership as any).company_id;
      } else {
        // fallback: check employees table for company_id
        const { data: employee } = await adminClient
          .from("employees")
          .select("company_id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (employee && (employee as any).company_id) {
          companyId = (employee as any).company_id;
        }
      }

      if (companyId) {
        const { data: company } = await adminClient
          .from("companies")
          .select("id, name")
          .eq("id", companyId)
          .limit(1)
          .maybeSingle();

        if (company) {
          companyName = (company as any).name ?? null;
        }
      }

      return jsonResponse(200, {
        message: "Login successful",
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          full_name: profile.full_name,
          role,
          company_id: companyId,
          company_name: companyName,
        },
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
        },
        redirect_to: dashboardPathForRole(role),
      });
    }

    return jsonResponse(404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
