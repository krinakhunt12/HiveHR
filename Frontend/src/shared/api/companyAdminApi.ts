import { invokeApi, type Employee, type CompanyPolicy, type LeaveRequest, type TaskDirective } from "./baseApi";

export const companyAdminApi = {
  // --- Dashboard / Info ---
  getCompanyInfo: async () => {
     const data = await invokeApi('company/info', { method: 'GET' });
     return data;
  },

  updateCompanyInfo: async (payload: any) => {
     const data = await invokeApi('company/info', { method: 'PATCH', body: payload });
     return data;
  },

  // --- Employees ---
  listEmployees: async (params: { search?: string; status?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`employee?${query}`, { method: 'GET' });
    return data as { data: Employee[] };
  },

  createEmployee: async (payload: any) => {
    const data = await invokeApi('employee', { method: 'POST', body: payload });
    return data;
  },

  updateEmployee: async (id: string, payload: any) => {
    const data = await invokeApi(`employee/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  deleteEmployee: async (id: string) => {
    const data = await invokeApi(`employee/${id}`, { method: 'DELETE' });
    return data;
  },

  // --- Policies ---
  listPolicies: async (params: { type?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[] };
  },

  createPolicy: async (payload: any) => {
    const data = await invokeApi('policies', { method: 'POST', body: payload });
    return data;
  },

  updatePolicy: async (id: string, payload: any) => {
    const data = await invokeApi(`policies/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  deletePolicy: async (id: string) => {
    const data = await invokeApi(`policies/${id}`, { method: 'DELETE' });
    return data;
  },

  // --- Leave ---
  listLeaves: async (params: { status?: string; employee_id?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`leave?${query}`, { method: 'GET' });
    return data as { data: LeaveRequest[] };
  },

  reviewLeave: async (id: string, payload: { status: string }) => {
    const data = await invokeApi(`leave/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  // --- Leave Configurations ---
  getLeaveConfigurations: async () => {
    const data = await invokeApi('company/leave-configurations', { method: 'GET' });
    return data as { data: { id: string; leave_type: string; annual_allowance: number }[] };
  },

  updateLeaveConfigurations: async (configurations: { leave_type: string; annual_allowance: number }[]) => {
    const data = await invokeApi('company/leave-configurations', { method: 'PUT', body: { configurations } });
    return data;
  },
};

