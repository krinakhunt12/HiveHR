import { supabase } from "./supabase";

export type UserRole = 'admin' | 'company_admin' | 'employee';

export interface Employee {
  id: string;
  company_id: string;
  department_id: string | null;
  user_id: string | null;
  employee_code: string;
  full_name: string;
  designation: string;
  employment_type: string;
  joined_on: string;
  salary: number | null;
  status: string;
  created_at: string;
  departments?: { id: string; name: string };
}

export interface CompanyPolicy {
  id: string;
  company_id: string;
  title: string;
  policy_type: string;
  content: string;
  effective_from: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  work_minutes: number | null;
  status: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  reason: string | null;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  employees?: { id: string; full_name: string; designation: string; company_id: string };
}

export interface Profile {
  user_id: string;
  full_name: string;
  role: UserRole;
  company_id: string | null;
  created_at: string;
  companies?: { id: string; name: string };
}

/**
 * Reads the access_token from the Zustand persisted store in localStorage.
 */
function getAccessTokenFromStore(): string | null {
  try {
    const raw = localStorage.getItem('hivehr_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Universal invoker using standard Fetch to ensure full control over headers.
 */
async function invokeHr(path: string, options: any = {}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let token = getAccessTokenFromStore();
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token ?? null;
  }

  if (!token) {
    throw new Error('No authentication session found. Please log in.');
  }

  // Build final URL manually to avoid SDK mapping issues
  const [funcName, ...queryParts] = path.split('?');
  const queryString = queryParts.join('?');
  const url = `${supabaseUrl}/functions/v1/${funcName}${queryString ? '?' + queryString : ''}`;

  const fetchOptions: RequestInit = {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[hrApi] Error ${response.status} calling ${path}:`, errorData);
    
    // Auto-logout if truly unauthorized and session is invalid
    if (response.status === 401 && errorData.error === 'Invalid JWT') {
        // Optional: clear local storage and reload?
        // localStorage.removeItem('hivehr_session');
        // window.location.href = '/login';
    }
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const hrApi = {
  // --- Profile ---
  getMe: async () => {
    const data = await invokeHr('profile', { method: 'GET' });
    return data as Profile;
  },

  updateMe: async (payload: Partial<Profile>) => {
    const data = await invokeHr('profile', { method: 'PATCH', body: payload });
    return data;
  },

  // --- Employees ---
  listEmployees: async (params: { company_id?: string; search?: string; status?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeHr(`employee?${query}`, { method: 'GET' });
    return data as { data: Employee[]; pagination: any };
  },

  getEmployee: async (id: string) => {
    const data = await invokeHr(`employee/${id}`, { method: 'GET' });
    return data as Employee;
  },

  createEmployee: async (payload: any) => {
    const data = await invokeHr('employee', { method: 'POST', body: payload });
    return data;
  },

  updateEmployee: async (id: string, payload: any) => {
    const data = await invokeHr(`employee/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  deleteEmployee: async (id: string) => {
    const data = await invokeHr(`employee/${id}`, { method: 'DELETE' });
    return data;
  },

  // --- Attendance ---
  getTodayAttendance: async () => {
    const data = await invokeHr('attendance', { method: 'GET' });
    return data as AttendanceLog | { status: 'absent' };
  },

  checkIn: async () => {
    const data = await invokeHr('attendance/check-in', { method: 'POST' });
    return data;
  },

  checkOut: async () => {
    const data = await invokeHr('attendance/check-out', { method: 'POST' });
    return data;
  },

  // --- Policies ---
  listPolicies: async (params: { company_id?: string; type?: string; include_inactive?: boolean } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeHr(`policies?${query}`, { method: 'GET' });
    return data as { data: CompanyPolicy[]; pagination: any };
  },

  createPolicy: async (payload: any) => {
    const data = await invokeHr('policies', { method: 'POST', body: payload });
    return data;
  },

  // --- Leave ---
  listLeaves: async (params: { status?: string; employee_id?: string; from?: string; to?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const data = await invokeHr(`leave?${query}`, { method: 'GET' });
    return data as { data: LeaveRequest[]; pagination: any };
  },

  submitLeave: async (payload: any) => {
    const data = await invokeHr('leave', { method: 'POST', body: payload });
    return data;
  },

  reviewLeave: async (id: string, payload: { status: string; admin_comment?: string }) => {
    const data = await invokeHr(`leave/${id}`, { method: 'PATCH', body: payload });
    return data;
  },

  getLeaveSummary: async (year?: number) => {
    const query = year ? `?year=${year}` : '';
    const data = await invokeHr(`leave/summary${query}`, { method: 'GET' });
    return data as { year: number; summary: Record<string, number> };
  }
};
