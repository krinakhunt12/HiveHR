export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

import { clearAuthSession, getAccessToken, isSessionExpired } from "@/shared/auth/session";

export interface Employee {
  id: string;
  company_id: string;
  department_id: string | null;
  user_id: string | null;
  employee_code: string;
  full_name: string;
  designation: string;
  employment_type: EmploymentType;
  joined_on: string;
  salary: number | null;
  status: EmployeeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceLog {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  work_minutes: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyPolicy {
  id: string;
  company_id: string;
  title: string;
  policy_type: string;
  content: string;
  effective_from: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCreateInput {
  company_id: string;
  department_id?: string | null;
  user_id?: string | null;
  employee_code: string;
  full_name: string;
  designation: string;
  employment_type?: EmploymentType;
  joined_on: string;
  salary?: number | null;
  status?: EmployeeStatus;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {}

export interface PolicyCreateInput {
  company_id: string;
  title: string;
  policy_type?: string;
  content: string;
  effective_from?: string | null;
  is_active?: boolean;
}

export interface PolicyUpdateInput extends Partial<Omit<PolicyCreateInput, "company_id">> {}

export interface AttendanceFilter {
  company_id?: string;
  employee_id?: string;
  attendance_date?: string;
}

export interface MeProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "company_admin" | "employee" | null;
  company_id: string | null;
  employee_id: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const edgeFunctionBaseUrl = supabaseUrl ? `${supabaseUrl}/functions/v1` : "";

export const hrApiBaseUrls = {
  profile: edgeFunctionBaseUrl ? `${edgeFunctionBaseUrl}/profile-api` : "",
  employees: edgeFunctionBaseUrl ? `${edgeFunctionBaseUrl}/employees-api` : "",
  attendance: edgeFunctionBaseUrl ? `${edgeFunctionBaseUrl}/attendance-api` : "",
  policies: edgeFunctionBaseUrl ? `${edgeFunctionBaseUrl}/policies-api` : "",
};

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authToken = getAccessToken();

  if (anonKey) {
    headers.apikey = anonKey;
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

function ensureConfigured(baseUrl: string): void {
  if (!baseUrl) {
    throw new Error("Missing Edge Function base URL. Set VITE_SUPABASE_URL.");
  }

  if (!anonKey) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY.");
  }
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  ensureConfigured(baseUrl);
  const url = `${baseUrl}${path}`;
  const headers = {
    ...buildHeaders(),
    ...(init?.headers ?? {}),
  };

  try {
    const snapshot = { ...headers } as Record<string, unknown>;
    const authHeader = (snapshot.Authorization as string) || (snapshot.authorization as string) || "";
    const maskedAuth = authHeader ? `${authHeader.slice(0, 8)}...${authHeader.slice(-6)}` : "";
    snapshot.Authorization = maskedAuth;
    console.log('hrApi.request ->', { url, method: init?.method ?? 'GET', headers: snapshot });
  } catch {}

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  try { console.log('hrApi.response ->', { url, status: response.status, payload }); } catch {}

  if (!response.ok) {
    if (response.status === 401) {
      try {
        if (isSessionExpired()) {
          clearAuthSession();
          // Proactively redirect to login if we detect an expired session
          if (typeof window !== "undefined") {
             window.location.href = "/login";
          }
        }
      } catch {}


      const unauthorizedMessage = typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : "Unauthorized";

      throw new Error(`Session error (${unauthorizedMessage}). Please login again.`);
    }

    const message = typeof payload?.error === "string" ? payload.error : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export const hrApi = {
  getHealth: () => request<{ ok: boolean; service: string; timestamp: string }>(hrApiBaseUrls.profile, "/health"),
  getMe: () => request<{ data: MeProfile }>(hrApiBaseUrls.profile, "/me"),

  listEmployees: (companyId?: string) => {
    const query = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
    return request<{ data: Employee[] }>(hrApiBaseUrls.employees, `/employees${query}`);
  },

  getEmployee: (employeeId: string) => request<{ data: Employee }>(hrApiBaseUrls.employees, `/employees/${employeeId}`),

  createEmployee: (input: EmployeeCreateInput) =>
    request<{ data: Employee }>(hrApiBaseUrls.employees, "/employees", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateEmployee: (employeeId: string, input: EmployeeUpdateInput) =>
    request<{ data: Employee }>(hrApiBaseUrls.employees, `/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  deleteEmployee: (employeeId: string) =>
    request<{ message: string }>(hrApiBaseUrls.employees, `/employees/${employeeId}`, {
      method: "DELETE",
    }),

  listAttendance: (filter: AttendanceFilter = {}) => {
    const params = new URLSearchParams();
    if (filter.company_id) params.set("company_id", filter.company_id);
    if (filter.employee_id) params.set("employee_id", filter.employee_id);
    if (filter.attendance_date) params.set("attendance_date", filter.attendance_date);
    const query = params.toString() ? `?${params.toString()}` : "";

    return request<{ data: AttendanceLog[] }>(hrApiBaseUrls.attendance, `/attendance${query}`);
  },

  checkIn: (input: { employee_id: string; company_id: string; attendance_date?: string }) =>
    request<{ data: AttendanceLog; message: string }>(hrApiBaseUrls.attendance, "/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  checkOut: (input: { employee_id: string; attendance_date?: string }) =>
    request<{ data: AttendanceLog; message: string }>(hrApiBaseUrls.attendance, "/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listPolicies: (companyId: string) => request<{ data: CompanyPolicy[] }>(hrApiBaseUrls.policies, `/policies?company_id=${encodeURIComponent(companyId)}`),

  createPolicy: (input: PolicyCreateInput) =>
    request<{ data: CompanyPolicy }>(hrApiBaseUrls.policies, "/policies", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updatePolicy: (policyId: string, input: PolicyUpdateInput) =>
    request<{ data: CompanyPolicy }>(hrApiBaseUrls.policies, `/policies/${policyId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  deletePolicy: (policyId: string) =>
    request<{ message: string }>(hrApiBaseUrls.policies, `/policies/${policyId}`, {
      method: "DELETE",
    }),
};
