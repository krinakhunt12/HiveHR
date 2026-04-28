import type { AppRole } from '../auth/roles';

/**
 * Robustly detects the user's role from a session user object or Supabase user.
 * Backend now returns role as: admin | company_admin | employee
 * UI uses 'admin' as alias for 'admin'.
 */
export function detectRole(user: any): AppRole {
  if (!user) return 'employee';

  // 1. Direct role field (from our auth store session.user.role)
  const role = user.role
    || user.app_metadata?.role
    || user.user_metadata?.role;

  if (role === 'admin') return 'admin';
  if (role === 'company_admin') return 'company_admin';
  if (role === 'employee') return 'employee';

  // Fallback
  return 'employee';
}
