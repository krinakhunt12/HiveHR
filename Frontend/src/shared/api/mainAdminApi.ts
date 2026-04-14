import { invokeApi, type Employee, type CompanyPolicy } from "./baseApi";

export const mainAdminApi = {
  // --- Global Employee Management ---
  listAllEmployees: async (params: { company_id?: string; search?: string; status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`admin/employees?${query}`, { method: 'GET' });
    return data as { data: Employee[]; pagination: any };
  },

  // --- Company Management ---
  listCompanies: async () => {
    const data = await invokeApi('admin/companies', { method: 'GET' });
    return data;
  },

  // --- Global Policies ---
  listGlobalPolicies: async (params: { company_id?: string; type?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`admin/policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[]; pagination: any };
  }
};
