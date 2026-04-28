/**
 * Centralized role definitions for the HR Platform.
 * Matches the role enum in the Supabase backend: admin | company_admin | employee
 */

export type AppRole = 'admin' | 'company_admin' | 'employee';

export const roleLabels: Record<AppRole, string> = {
  admin: 'Super Admin (Platform Owner)',
  company_admin: 'Company Admin (HR Manager)',
  employee: 'Employee',
};

export const roleDashboardPath: Record<AppRole, string> = {
  admin: '/dashboard/admin',
  company_admin: '/dashboard/company',
  employee: '/dashboard/employee',
};
