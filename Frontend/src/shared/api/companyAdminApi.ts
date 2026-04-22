/**
 * companyAdminApi.ts — Imperative API helpers for company admin operations.
 * For React components, prefer the hooks in hrHooks.ts.
 * These helpers are for one-off imperative calls.
 */

import { invokeAndUnwrap } from './baseApi';

export const companyAdminApi = {
  // Dashboard stats (company-scoped)
  getDashboard: () => invokeAndUnwrap('dashboard'),

  // Company info
  getCompanyInfo: () => invokeAndUnwrap('company/info'),

  // Departments
  getDepartments: () => invokeAndUnwrap('departments'),
};
