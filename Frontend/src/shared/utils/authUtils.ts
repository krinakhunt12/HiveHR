
export type AppRole = 'admin' | 'company_admin' | 'employee';

/**
 * Robustly detects the user's role from a Supabase User object.
 * Checks app_metadata and user_metadata before falling back to the top-level role.
 */
export function detectRole(user: any): AppRole {
  if (!user) return 'employee';

  // 1. Check specialized metadata fields (highest priority)
  const role = user.app_metadata?.role || user.user_metadata?.role;
  if (role === 'admin' || role === 'company_admin' || role === 'employee') {
    return role as AppRole;
  }

  // 2. Fallback to top-level role if it's not the generic 'authenticated'
  if (user.role && user.role !== 'authenticated' && user.role !== 'anon') {
    return user.role as AppRole;
  }

  // 3. Default to employee
  return 'employee';
}
