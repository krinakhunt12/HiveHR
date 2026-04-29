import type { AppRole } from "@/shared/auth/roles";
import { AUTH_SESSION_KEY } from "@/shared/constants";

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
    company_id?: string | null;
    company_name?: string | null;
    employee_id?: string | null;
  };
}

function isAppRole(value: string): value is AppRole {
  return value === "admin" || value === "company_admin" || value === "employee";
}

function parseAuthSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    if (
      typeof parsed?.access_token !== "string" ||
      typeof parsed?.refresh_token !== "string" ||
      typeof parsed?.expires_at !== "number" ||
      typeof parsed?.user?.id !== "string" ||
      typeof parsed?.user?.email !== "string" ||
      typeof parsed?.user?.full_name !== "string" ||
      typeof parsed?.user?.role !== "string" ||
      !isAppRole(parsed.user.role)
    ) {
      return null;
    }

    return parsed as AuthSession;
  } catch {
    return null;
  }
}


export function getAuthSession(): AuthSession | null {
  const stored = parseAuthSession(localStorage.getItem(AUTH_SESSION_KEY));
  if (stored) {
    try { console.log("getAuthSession -> parsed session", { ok: true, exp: stored.expires_at }); } catch {}
    return stored;
  }

  return null;
}

export function setAuthSession(session: AuthSession): void {
  try { console.log("setAuthSession -> storing session for", session.user.email); } catch {}
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function setAuthRole(role: AppRole): void {
  const session = getAuthSession();
  if (session) {
    session.user.role = role;
    setAuthSession(session);
    return;
  }

  // create a minimal session object if none exists
  const minimal: AuthSession = {
    access_token: "",
    refresh_token: "",
    expires_at: 0,
    user: {
      id: "",
      email: "",
      full_name: "",
      role,
    },
  };

  setAuthSession(minimal);
}

export function isSessionExpired(): boolean {
  const session = getAuthSession();
if (!session || session.expires_at == null) return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expired = session.expires_at < nowInSeconds;
  
  if (expired) {
    try { console.warn("isSessionExpired -> session is expired", { exp: session.expires_at, now: nowInSeconds }); } catch {}
  }
  
  return expired;
}

export function getAccessToken(): string | null {
  if (isSessionExpired()) {
    return null;
  }
  const token = getAuthSession()?.access_token ?? null;
  try { if (token) console.log("getAccessToken -> token present:", true); } catch {}
  return token;
}
