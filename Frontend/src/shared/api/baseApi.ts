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
  type: string;
  rules: string;
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

export interface TaskDirective {
  id: string;
  company_id: string;
  employee_id: string | null; // Null means global/departmental
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  due_date: string | null;
  created_at: string;
  employees?: { id: string; full_name: string; designation: string };
}

export interface Profile {
  user_id: string;
  full_name: string;
  role: UserRole;
  company_id: string | null;
  is_first_login: boolean;
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
export async function invokeApi(path: string, options: any = {}) {
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
    console.error(`[api] Error ${response.status} calling ${path}:`, errorData);
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
