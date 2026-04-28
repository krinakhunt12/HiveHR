/**
 * baseApi.ts — Central API invoker for all Supabase Edge Function calls.
 * Rebuilt to match the rebuilt backend's response format exactly.
 *
 * Success: { success: true, message, data: T, meta?: PaginationMeta, timestamp }
 * Error:   { success: false, code, message, errors?: FieldError[], timestamp }
 */

// ─── Response Envelope Types ────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta: PaginationMeta | null;
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  code: string;
  fieldErrors: FieldError[] | null;
  statusCode: number;
  constructor(message: string, code: string, statusCode: number, errors?: FieldError[] | null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = errors ?? null;
  }
}

// ─── Domain Types (matches rebuilt Supabase schema) ─────────────────────────

export type UserRole = 'admin' | 'admin' | 'company_admin' | 'employee';

export interface Employee {
  id: string;
  user_id: string | null;
  company_id: string;
  employee_code: string;
  full_name: string;
  designation: string;
  designation_name?: string | null;   // resolved by backend normalizer
  employment_type: 'full_time' | 'part_time' | 'contract';
  work_location?: 'office' | 'remote' | 'hybrid';
  joined_on?: string | null;
  date_of_joining?: string | null;    // new schema field name
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  status: 'active' | 'inactive' | 'probation';
  department_id?: string | null;
  designation_id?: string | null;
  policy_id?: string | null;
  manager_id?: string | null;
  created_at: string;
  departments?: { id: string; name: string } | null;
  designations?: { id: string; name: string } | null;
  work_policies?: { id: string; policy_name: string } | null;
}

export interface WorkPolicy {
  id: string;
  company_id: string;
  policy_name: string;
  shift_start: string;
  shift_end: string;
  total_hours_required: number;
  break_duration_minutes: number;
  net_work_hours_required: number;
  grace_period_minutes: number;
  overtime_threshold_minutes: number;
  half_day_threshold_hours: number;
  applicable_days: string[];
  is_default: boolean;
  is_flexible: boolean;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  company_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  raw_hours_minutes: number | null;
  net_work_minutes: number | null;
  break_minutes: number | null;
  overtime_minutes: number | null;
  late_minutes: number | null;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday' | 'weekend' | 'wfh';
  is_manual_entry: boolean;
  manual_reason?: string | null;
  policy_id?: string | null;
  created_at: string;
  updated_at: string;
  // Legacy compat aliases used by EmployeeDashboard
  check_in_at?: string | null;
  check_out_at?: string | null;
  work_minutes?: number | null;
}

export interface LeaveType {
  id: string;
  company_id: string;
  name: string;
  is_paid: boolean;
  annual_quota: number;
  carry_forward: boolean;
  max_carry_forward: number | null;
  min_notice_days: number;
  requires_document: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  quota: number;
  taken: number;
  carry_forward: number;
  pending: number;
  available: number;
  leave_types?: LeaveType | null;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  document_url?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewed_by?: string | null;
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  employees?: { id: string; full_name: string; designation: string; company_id: string } | null;
  leave_types?: LeaveType | null;
  // Legacy compat aliases
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  admin_comment?: string | null;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  head_id?: string | null;
  created_at: string;
  employee_count?: number;
}

export interface ProfileUser {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  company_id: string | null;
  is_first_login: boolean;
  created_at: string;
  companies?: { id: string; name: string } | null;
  employee?: Employee | null;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  plan_id?: string | null;
  plan_status: 'active' | 'expired' | 'suspended';
  plan_start_date?: string | null;
  plan_end_date?: string | null;
  is_active: boolean;
  created_at: string;
  plans?: Plan | null;
  employee_count?: number;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  max_employees: number;
  max_admins: number;
  max_departments: number;
  max_leave_types: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

import { useAuthStore } from '../auth/store';

// ─── Token Helper ───────────────────────────────────────────────────────────

function getAccessTokenFromStore(): string | null {
  try {
    const raw = localStorage.getItem('hivehr_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const session = parsed?.state?.session;
    if (!session) return null;

    // Optional: Pre-emptive expiration check (Supabase tokens use seconds)
    if (session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) return null;
    }

    return session.access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Core Invoker ───────────────────────────────────────────────────────────

export interface InvokeOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  isPublic?: boolean;
}

export async function invokeApi<T = any>(path: string, options: InvokeOptions = {}): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new ApiError('Supabase config missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'CONFIG_ERROR', 0);
  }

  const token = options.isPublic ? anonKey : (getAccessTokenFromStore() || anonKey);

  const [funcAndPath, ...queryParts] = path.split('?');
  const queryString = queryParts.join('?');
  const url = `${supabaseUrl}/functions/v1/${funcAndPath}${queryString ? '?' + queryString : ''}`;
  const method = options.method ?? (options.body ? 'POST' : 'GET');

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      body: options.body && method !== 'GET' ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Please check your connection.', 'NETWORK_ERROR', 0);
  }

  let body: any;
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    // If JWT is expired or invalid (401), automatically clear session and log out
    if (response.status === 401 && !options.isPublic) {
      console.warn('JWT Expired or Unauthorized. Force logging out...');
      useAuthStore.getState().clearSession();
      // Optional: window.location.href = '/login';
    }

    const message = body?.message || `Request failed (${response.status})`;
    const code = body?.code || `HTTP_${response.status}`;
    throw new ApiError(message, code, response.status, body?.errors ?? null);
  }

  return body as T;
}

/** Invoke and return .data from the standard success envelope */
export async function invokeAndUnwrap<T = any>(path: string, options: InvokeOptions = {}): Promise<T> {
  const res = await invokeApi<ApiSuccessResponse<T>>(path, options);
  return res.data;
}
