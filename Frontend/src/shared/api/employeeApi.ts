import { invokeApi, type Profile, type AttendanceLog, type CompanyPolicy, type LeaveRequest, type TaskDirective } from "./baseApi";

export const employeeApi = {
  // --- Profile ---
  getMe: async () => {
    const data = await invokeApi('employee/profile', { method: 'GET' });
    return data as Profile;
  },

  updateMe: async (payload: Partial<Profile>) => {
    const data = await invokeApi('employee/profile', { method: 'PATCH', body: payload });
    return data;
  },

  // --- Attendance ---
  getTodayAttendance: async () => {
    const data = await invokeApi('employee/attendance', { method: 'GET' });
    return data as AttendanceLog | { status: 'absent' };
  },

  checkIn: async () => {
    const data = await invokeApi('employee/attendance/check-in', { method: 'POST' });
    return data;
  },

  checkOut: async () => {
    const data = await invokeApi('employee/attendance/check-out', { method: 'POST' });
    return data;
  },

  // --- Policies ---
  listPolicies: async (params: { type?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`employee/policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[]; pagination: any };
  },

  // --- Leave ---
  listLeaves: async (params: { status?: string; from?: string; to?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`employee/leave?${query}`, { method: 'GET' });
    return data as { data: LeaveRequest[]; pagination: any };
  },

  submitLeave: async (payload: any) => {
    const data = await invokeApi('employee/leave', { method: 'POST', body: payload });
    return data;
  },

  getLeaveSummary: async (year?: number) => {
    const query = year ? `?year=${year}` : '';
    const data = await invokeApi(`employee/leave/summary${query}`, { method: 'GET' });
    return data as { year: number; summary: Record<string, number> };
  },

  // --- Tasks (Directives) ---
  listTasks: async (params: { status?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeApi(`employee/tasks?${query}`, { method: 'GET' });
    return data as { data: TaskDirective[]; pagination: any };
  },

  updateTaskStatus: async (id: string, status: string) => {
    const data = await invokeApi(`employee/tasks/${id}/status`, { method: 'PATCH', body: { status } });
    return data;
  }
};
