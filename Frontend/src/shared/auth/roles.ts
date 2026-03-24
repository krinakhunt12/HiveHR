export type AppRole = "admin" | "company_admin" | "employee";

const rolePriority: Record<AppRole, number> = {
  admin: 3,
  company_admin: 2,
  employee: 1,
};

export function getCurrentRole(): AppRole {
  try {
    const raw = localStorage.getItem("hivehr_auth_session");
    if (raw) {
      const parsed = JSON.parse(raw) as { user?: { role?: string } };
      const role = parsed?.user?.role;
      if (role === "admin" || role === "company_admin" || role === "employee") {
        return role;
      }
    }
  } catch {
    // ignore parse errors
  }

  return "employee";
}

export function setCurrentRole(role: AppRole): void {
  try {
    const raw = localStorage.getItem("hivehr_auth_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.user = parsed.user || {};
      parsed.user.role = role;
      localStorage.setItem("hivehr_auth_session", JSON.stringify(parsed));
      return;
    }
  } catch {}

  // create a minimal session object if none exists
  const minimal = { access_token: "", refresh_token: "", expires_at: 0, user: { id: "", email: "", full_name: "", role } };
  try {
    localStorage.setItem("hivehr_auth_session", JSON.stringify(minimal));
  } catch {}
}

export function canAccess(role: AppRole, required: AppRole): boolean {
  return rolePriority[role] >= rolePriority[required];
}

export function dashboardPathForRole(role: AppRole): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "company_admin") return "/dashboard/company";
  return "/dashboard/employee";
}

export const roleLabels: Record<AppRole, string> = {
  admin: "Main Admin",
  company_admin: "Company Admin",
  employee: "Employee",
};
