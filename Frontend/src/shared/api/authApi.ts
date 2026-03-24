import type { AppRole } from "@/shared/auth/roles";

interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  redirect_to: string;
}

interface SignupResponse {
  message: string;
  user_id: string;
  role: AppRole;
  company_id: string | null;
  redirect_to: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const authApiBaseUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/auth-api` : "";

function ensureConfigured(): void {
  if (!authApiBaseUrl) {
    throw new Error("Missing auth API base URL. Set VITE_SUPABASE_URL.");
  }

  if (!anonKey) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY.");
  }
}

async function post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  ensureConfigured();

  const response = await fetch(`${authApiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const authApi = {
  login: (payload: { email: string; password: string }) => post<LoginResponse>("/login", payload),

  signup: (payload: {
    email: string;
    password: string;
    full_name: string;
    role: AppRole;
    company_name?: string;
    company_id?: string;
    employee_code?: string;
    designation?: string;
    joined_on?: string;
  }) => post<SignupResponse>("/signup", payload),
};

export type { LoginResponse, SignupResponse };
