export * from './baseApi';
export { employeeApi } from './employeeApi';
export { companyAdminApi } from './companyAdminApi';
export { mainAdminApi } from './mainAdminApi';

import { employeeApi } from './employeeApi';
import { companyAdminApi } from './companyAdminApi';
import { mainAdminApi } from './mainAdminApi';

/**
 * @deprecated Use role-specific API objects (employeeApi, companyAdminApi, mainAdminApi) instead.
 * This facade is kept for backward compatibility during migration.
 */
export const hrApi = {
  ...employeeApi,
  ...companyAdminApi,
  ...mainAdminApi,
  
  // Explicitly mapping some that might conflict or need specific names
  listEmployees: companyAdminApi.listEmployees,
  listPolicies: employeeApi.listPolicies, // Default to employee version
  listLeaves: employeeApi.listLeaves,
};
