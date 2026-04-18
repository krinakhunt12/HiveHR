import { invokeApi, type Profile, type CompanyPolicy, type LeaveRequest } from "./baseApi";

export const employeeApi = {
  // --- Profile ---
  getMe: async () => {
    const data = await invokeApi('profile', { method: 'GET' });
    return data;
  },

  updateMe: async (payload: Partial<Profile>) => {
    const data = await invokeApi('profile', { method: 'PATCH', body: payload });
    return data;
  },

  // --- Attendance ---
  getTodayAttendance: async () => {
    const data = await invokeApi('attendance', { method: 'GET' });
    // Returns data array, get first
    return (data as any).data?.[0] || { status: 'absent' };
  },

  checkIn: async () => {
    const data = await invokeApi('attendance', { method: 'POST', body: {} });
    return data;
  },

  checkOut: async (id: string) => {
    const data = await invokeApi(`attendance/${id}`, { method: 'PATCH', body: {} });
    return data;
  },

  // --- Policies ---
  listPolicies: async (params: { type?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[] };
  },

  // --- Leave ---
  listLeaves: async (params: { status?: string; from?: string; to?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`leave?${query}`, { method: 'GET' });
    return data as { data: LeaveRequest[] };
  },

  submitLeave: async (payload: any) => {
    const data = await invokeApi('leave', { method: 'POST', body: payload });
    return data;
  },

  getLeaveSummary: async (year?: number) => {
    const query = year ? `?year=${year}` : '';
    const data = await invokeApi(`leave/summary${query}`, { method: 'GET' });
    return data;
  },


  getLeaveConfigurations: async () => {
    const data = await invokeApi('company/leave-configurations', { method: 'GET' });
    return data as { data: { id: string; leave_type: string; annual_allowance: number }[] };
  },

  // --- Tasks ---
  listTasks: async (params: { status?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`tasks?${query}`, { method: 'GET' });
    return data as { data: import("./baseApi").TaskDirective[] };
  },

  updateTaskStatus: async (id: string, status: string) => {
    const data = await invokeApi(`tasks/${id}`, { method: 'PATCH', body: { status } });
    return data;
  },
};


