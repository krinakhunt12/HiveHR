/**
 * Centralized role definitions for the HR Platform.
 * Matches the role enum in the Supabase backend: super_admin | company_admin | employee
 * NOTE: 'admin' is kept as an alias for 'super_admin' for backward compat in the UI.
 */

export type AppRole = 'super_admin' | 'admin' | 'company_admin' | 'employee';

export const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin (Platform Owner)',
  admin: 'Super Admin (Platform Owner)',
  company_admin: 'Company Admin (HR Manager)',
  employee: 'Employee',
};

export const roleDashboardPath: Record<AppRole, string> = {
  super_admin: '/dashboard/admin',
  admin: '/dashboard/admin',
  company_admin: '/dashboard/company',
  employee: '/dashboard/employee',
};
