import { invokeApi, type Employee, type CompanyPolicy, type LeaveRequest, type TaskDirective } from "./baseApi";

export const companyAdminApi = {
  // --- Employees ---
  listEmployees: async (params: { search?: string; status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`company/employees?${query}`, { method: 'GET' });
    return data as { data: Employee[]; pagination: any };
  },

  getEmployee: async (id: string) => {
    const data = await invokeApi(`company/employees/${id}`, { method: 'GET' });
    return data as Employee;
  },

  createEmployee: async (payload: any) => {
    const data = await invokeApi('company/employees', { method: 'POST', body: payload });
    return data;
  },

  updateEmployee: async (id: string, payload: any) => {
    const data = await invokeApi(`company/employees/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  deleteEmployee: async (id: string) => {
    const data = await invokeApi(`company/employees/${id}`, { method: 'DELETE' });
    return data;
  },

  // --- Policies ---
  listPolicies: async (params: { type?: string; include_inactive?: boolean } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`company/policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[]; pagination: any };
  },

  createPolicy: async (payload: any) => {
    const data = await invokeApi('company/policies', { method: 'POST', body: payload });
    return data;
  },

  // --- Leave ---
  listLeaves: async (params: { status?: string; employee_id?: string; from?: string; to?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`company/leaves?${query}`, { method: 'GET' });
    return data as { data: LeaveRequest[]; pagination: any };
  },

  reviewLeave: async (id: string, payload: { status: string; admin_comment?: string }) => {
    const data = await invokeApi(`company/leaves/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  // --- Tasks (Directives) ---
  listTasks: async (params: { employee_id?: string; status?: string; priority?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`company/tasks?${query}`, { method: 'GET' });
    return data as { data: TaskDirective[]; pagination: any };
  },

  createTask: async (payload: Partial<TaskDirective>) => {
    const data = await invokeApi('company/tasks', { method: 'POST', body: payload });
    return data;
  },

  updateTask: async (id: string, payload: Partial<TaskDirective>) => {
    const data = await invokeApi(`company/tasks/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  deleteTask: async (id: string) => {
    const data = await invokeApi(`company/tasks/${id}`, { method: 'DELETE' });
    return data;
  }
};
