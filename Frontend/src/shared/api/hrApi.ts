import { supabase } from "./supabase";

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
  profile_photo_url: string | null;
  created_at: string;
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
  status: string;
  created_at: string;
}

// Generic response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface EmployeeCreateInput {
  company_id: string;
  employee_code: string;
  full_name: string;
  designation: string;
  joined_on: string;
  department_id?: string;
  user_id?: string;
  employment_type?: string;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  id: string;
}

export interface PolicyCreateInput {
  company_id: string;
  title: string;
  content: string;
}

export interface AttendanceFilter {
  company_id?: string;
  employee_id?: string;
  start_date?: string;
  end_date?: string;
}

const MASTER_API = "hr-api";

export const hrApi = {
  // Employees
  listEmployees: async (companyId?: string) => {
    const path = `hr-api/employees${companyId ? `?company_id=${companyId}` : ""}`;
    const { data, error } = await supabase.functions.invoke(path);
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<Employee[]>;
  },

  getEmployee: async (id: string) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/employees/${id}`);
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<Employee>;
  },

  createEmployee: async (input: EmployeeCreateInput) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/employees`, {
      method: "POST",
      body: input
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<Employee>;
  },

  updateEmployee: async (id: string, input: EmployeeUpdateInput) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/employees/${id}`, {
      method: "PUT",
      body: input
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<Employee>;
  },

  deleteEmployee: async (id: string) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/employees/${id}`, {
      method: "DELETE"
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<void>;
  },

  // Policies
  listPolicies: async (companyId?: string) => {
    const path = `hr-api/policies${companyId ? `?company_id=${companyId}` : ""}`;
    const { data, error } = await supabase.functions.invoke(path);
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<CompanyPolicy[]>;
  },

  createPolicy: async (input: PolicyCreateInput) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/policies`, {
      method: "POST",
      body: input
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<CompanyPolicy>;
  },

  // Attendance
  listAttendance: async (filter: AttendanceFilter = {}) => {
    const params = new URLSearchParams(filter as any).toString();
    const path = `hr-api/attendance${params ? `?${params}` : ""}`;
    const { data, error } = await supabase.functions.invoke(path);
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<AttendanceLog[]>;
  },

  checkIn: async (input: { employee_id: string; company_id: string; attendance_date?: string }) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/attendance/check-in`, {
      method: "POST",
      body: input
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<AttendanceLog>;
  },

  checkOut: async (input: { id: string }) => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/attendance/check-out`, {
      method: "POST",
      body: input
    });
    if (error) throw new Error(error.message || data?.error);
    return data as ApiResponse<AttendanceLog>;
  },

  // MeProfile
  getMe: async () => {
    const { data, error } = await supabase.functions.invoke(`${MASTER_API}/me`);
    if (error) throw new Error(error.message || data?.error);
    return data as { data: any };
  }
};
