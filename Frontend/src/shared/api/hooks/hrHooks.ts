/**
 * hrHooks.ts — All React Query hooks for the HR platform.
 *
 * SECURITY RULE: Never pass company_id as a query param.
 * The backend always reads company_id from the JWT token context.
 *
 * Endpoint mapping (matches rebuilt Supabase edge functions):
 *   /dashboard      → role-scoped stats
 *   /employee       → employee CRUD (company_admin)
 *   /profile        → own profile (all roles)
 *   /attendance     → check-in/out, records, summary
 *   /leave          → apply, approve, reject, types, balance
 *   /policies       → work policy CRUD + assignment
 *   /departments    → department CRUD
 *   /company        → company info + settings
 *   /admin          → super_admin: companies, plans
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invokeApi,
  invokeAndUnwrap,
  type Employee,
  type WorkPolicy,
  type AttendanceRecord,
  type LeaveType,
  type LeaveBalance,
  type LeaveRequest,
  type Department,
  type ProfileUser,
  type Company,
  type Plan,
  type ApiSuccessResponse,
} from '../baseApi';

// ─── Re-export Employee type for consumers ───────────────────────────────────
export type { Employee, WorkPolicy, AttendanceRecord, LeaveType, LeaveBalance, LeaveRequest };

// ─── Helper: build query string ──────────────────────────────────────────────
function qs(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!filtered.length) return '';
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
}

// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => invokeAndUnwrap('dashboard'),
    staleTime: 2 * 60 * 1000,
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  PROFILE  (all roles — own profile)
// ════════════════════════════════════════════════════════════════════════════

export function useGetMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => invokeAndUnwrap<ProfileUser>('profile'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useGetMyPolicy() {
  return useQuery({
    queryKey: ['my-policy'],
    queryFn: () => invokeAndUnwrap<WorkPolicy>('profile/policy'),
    staleTime: 10 * 60 * 1000,
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  EMPLOYEES  (company_admin)
// ════════════════════════════════════════════════════════════════════════════

interface ListEmployeesParams {
  // ✅ NO company_id — backend reads it from JWT
  department_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function useListEmployees(params: ListEmployeesParams = {}) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<Employee[]>>(
        `employee${qs(params)}`
      );
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => invokeAndUnwrap<Employee>(`employee/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export interface CreateEmployeePayload {
  full_name: string;
  email: string;
  password: string;
  designation: string;
  employee_code: string;
  role?: 'employee' | 'company_admin';
  employment_type?: string;
  work_location?: string;
  joined_on?: string;
  department_id?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  is_first_login?: boolean;
}

export interface UpdateEmployeePayload {
  full_name?: string;
  designation?: string;
  employee_code?: string;
  employment_type?: string;
  work_location?: string;
  department_id?: string;
  phone?: string;
  status?: string;
}

export function useEmployeeMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['employees'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      invokeApi('employee', { method: 'POST', body: payload }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      invokeApi(`employee/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      invokeApi(`employee/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: invalidate,
  });

  // Soft-delete: sets status = 'inactive'
  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`employee/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, remove };
}

// ════════════════════════════════════════════════════════════════════════════
//  ATTENDANCE  (all roles, scoped by JWT)
// ════════════════════════════════════════════════════════════════════════════

interface AttendanceParams {
  // ✅ NO company_id — backend reads it from JWT
  employee_id?: string;
  date?: string;
  month?: string;
  status?: string;
  department_id?: string;
  page?: number;
  limit?: number;
}

export function useListAttendance(params: AttendanceParams = {}) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<AttendanceRecord[]>>(
        `attendance${qs(params)}`
      );
      const data = res.data ?? [];
      const today = new Date().toISOString().split('T')[0];

      // Normalize all records for UI consistency
      data.forEach(record => {
        const baseDate = record.date || today;
        (record as any).check_in_at = record.check_in_time ? `${baseDate}T${record.check_in_time}Z` : null;
        (record as any).check_out_at = record.check_out_time ? `${baseDate}T${record.check_out_time}Z` : null;
        (record as any).work_minutes = record.net_work_minutes;
      });
      
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTodayAttendance() {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['attendance', 'today', today],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<AttendanceRecord[]>>(
        `attendance${qs({ date: today })}`
      );
      const records = res.data ?? [];
      const record = records[0] ?? null;
      // Normalize legacy field aliases for EmployeeDashboard compat
      if (record) {
        // Construct full ISO strings so new Date() works correctly in UI
        const baseDate = record.date || today;
        (record as any).check_in_at = record.check_in_time ? `${baseDate}T${record.check_in_time}Z` : null;
        (record as any).check_out_at = record.check_out_time ? `${baseDate}T${record.check_out_time}Z` : null;
        (record as any).work_minutes = record.net_work_minutes;
      }
      return record;
    },
    staleTime: 60 * 1000,
  });
}

export function useAttendanceSummary(month?: string) {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  return useQuery({
    queryKey: ['attendance', 'summary', currentMonth],
    queryFn: () =>
      invokeAndUnwrap(`attendance/summary${qs({ month: currentMonth })}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['attendance'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const checkIn = useMutation({
    mutationFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<AttendanceRecord>>('attendance', {
        method: 'POST',
        body: { action: 'check_in' },
      });
      // Helper inline since centralized failed to apply
      const record = res.data;
      if (record) {
        const today = new Date().toISOString().split('T')[0];
        const baseDate = record.date || today;
        (record as any).check_in_at = record.check_in_time ? `${baseDate}T${record.check_in_time}Z` : null;
        (record as any).check_out_at = record.check_out_time ? `${baseDate}T${record.check_out_time}Z` : null;
        (record as any).work_minutes = record.net_work_minutes;
      }
      return record;
    },
    onSuccess: invalidate,
  });

  const checkOut = useMutation({
    mutationFn: async (attendanceId: string) => {
      const res = await invokeApi<ApiSuccessResponse<AttendanceRecord>>(`attendance/${attendanceId}`, {
        method: 'PATCH',
        body: { action: 'check_out' },
      });
      const record = res.data;
      if (record) {
        const today = new Date().toISOString().split('T')[0];
        const baseDate = record.date || today;
        (record as any).check_in_at = record.check_in_time ? `${baseDate}T${record.check_in_time}Z` : null;
        (record as any).check_out_at = record.check_out_time ? `${baseDate}T${record.check_out_time}Z` : null;
        (record as any).work_minutes = record.net_work_minutes;
      }
      return record;
    },
    onSuccess: invalidate,
  });

  const manualEntry = useMutation({
    mutationFn: async (payload: {
      employee_id: string;
      date: string;
      check_in_time: string;
      check_out_time?: string;
      status?: string;
      reason: string;
    }) => {
      const res = await invokeApi<ApiSuccessResponse<AttendanceRecord>>('attendance/manual', { 
        method: 'POST', 
        body: payload 
      });
      const record = res.data;
      if (record) {
        const today = new Date().toISOString().split('T')[0];
        const baseDate = record.date || today;
        (record as any).check_in_at = record.check_in_time ? `${baseDate}T${record.check_in_time}Z` : null;
        (record as any).check_out_at = record.check_out_time ? `${baseDate}T${record.check_out_time}Z` : null;
        (record as any).work_minutes = record.net_work_minutes;
      }
      return record;
    },
    onSuccess: invalidate,
  });

  return { checkIn, checkOut, manualEntry };
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      try {
        await invokeApi('dashboard', { isPublic: false });
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    staleTime: 60 * 1000,
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  LEAVE TYPES  (company_admin manages, all can read)
// ════════════════════════════════════════════════════════════════════════════

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: () => invokeAndUnwrap<LeaveType[]>('leave/types'),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Legacy alias used by LeaveManagementView and LeaveRequestModal.
 * Maps backend LeaveType → old leave_configurations shape.
 */
export function useLeaveConfigurations() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const types = await invokeAndUnwrap<LeaveType[]>('leave/types');
      return types.map((t) => ({
        id: t.id,
        leave_type: t.name,
        annual_allowance: t.annual_quota,
        is_paid: t.is_paid,
        carry_forward: t.carry_forward,
        min_notice_days: t.min_notice_days,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}

export interface CreateLeaveTypePayload {
  name: string;
  is_paid: boolean;
  annual_quota: number;
  carry_forward: boolean;
  max_carry_forward?: number;
  min_notice_days?: number;
  requires_document?: boolean;
}

export function useLeaveConfigMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['leave-types'] });

  const create = useMutation({
    mutationFn: (payload: CreateLeaveTypePayload) =>
      invokeApi('leave/types', { method: 'POST', body: payload }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async (configs: { leave_type: string; annual_allowance: number }[]) => {
      for (const c of configs) {
        await invokeApi('leave/types', {
          method: 'POST',
          body: {
            name: c.leave_type,
            annual_quota: c.annual_allowance,
            is_paid: true,
            carry_forward: false,
            min_notice_days: 0,
          },
        });
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`leave/types/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

// ════════════════════════════════════════════════════════════════════════════
//  LEAVE REQUESTS  (all roles, scoped by JWT)
// ════════════════════════════════════════════════════════════════════════════

interface ListLeavesParams {
  // ✅ NO company_id — backend reads it from JWT
  employee_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useListLeaves(params: ListLeavesParams = {}) {
  return useQuery({
    queryKey: ['leaves', params],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<LeaveRequest[]>>(
        `leave${qs(params)}`
      );
      const leaves = res.data ?? [];
      // Normalize legacy field aliases
      return leaves.map((l) => ({
        ...l,
        leave_type: (l as any).leave_types?.name ?? (l as any).leave_type ?? 'Leave',
        start_date: l.from_date,
        end_date: l.to_date,
        admin_comment: l.review_note,
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: ['leave-balance'],
    queryFn: () => invokeAndUnwrap<LeaveBalance[]>('leave/balance'),
    staleTime: 5 * 60 * 1000,
  });
}

export interface ApplyLeavePayload {
  leave_type_id?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
  reason: string;
  document_url?: string;
}

export function useLeaveMutations() {
  const qc = useQueryClient();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['leaves'] });
    qc.invalidateQueries({ queryKey: ['leave-balance'] });
    qc.invalidateQueries({ queryKey: ['attendance'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const submit = useMutation({
    mutationFn: (payload: ApplyLeavePayload) => {
      const from_date = payload.from_date ?? payload.start_date;
      const to_date = payload.to_date ?? payload.end_date;

      let leave_type_id = payload.leave_type_id;
      if (!leave_type_id && payload.leave_type) {
        const match = leaveTypes.find(
          (t) => t.name.toLowerCase() === payload.leave_type!.toLowerCase()
        );
        leave_type_id = match?.id;
      }

      return invokeApi('leave', {
        method: 'POST',
        body: { leave_type_id, from_date, to_date, reason: payload.reason },
      });
    },
    onSuccess: invalidate,
  });

  const review = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: 'approved' | 'rejected'; review_note?: string };
    }) => {
      const endpoint = payload.status === 'approved'
        ? `leave/${id}/approve`
        : `leave/${id}/reject`;
      return invokeApi(endpoint, {
        method: 'PATCH',
        body: { review_note: payload.review_note ?? '' },
      });
    },
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`leave/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { submit, review, cancel };
}

// ════════════════════════════════════════════════════════════════════════════
//  WORK POLICIES  (company_admin — super_admin blocked on writes)
// ════════════════════════════════════════════════════════════════════════════

export function useListPolicies() {
  // ✅ NO company_id param — backend scopes by JWT
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<WorkPolicy[]>>('policies');
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useGetPolicy(id: string) {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: () => invokeAndUnwrap<WorkPolicy>(`policies/${id}`),
    enabled: !!id,
  });
}

export interface CreatePolicyPayload {
  policy_name: string;
  shift_start: string;
  shift_end: string;
  total_hours_required: number;
  break_duration_minutes: number;
  grace_period_minutes: number;
  overtime_threshold_minutes?: number;
  half_day_threshold_hours?: number;
  applicable_days: string[];
  is_default?: boolean;
  is_flexible?: boolean;
}

export function usePolicyMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['policies'] });

  const create = useMutation({
    mutationFn: (payload: CreatePolicyPayload) =>
      invokeApi('policies', { method: 'POST', body: payload }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePolicyPayload> }) =>
      invokeApi(`policies/${id}`, { method: 'PUT', body: data }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`policies/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const setDefault = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`policies/${id}/default`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const assign = useMutation({
    mutationFn: ({
      id,
      employee_id,
      department_id,
    }: {
      id: string;
      employee_id?: string;
      department_id?: string;
    }) =>
      invokeApi(`policies/${id}/assign`, {
        method: 'POST',
        body: { employee_id, department_id },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return { create, update, remove, setDefault, assign };
}

// ════════════════════════════════════════════════════════════════════════════
//  DEPARTMENTS  (company_admin)
// ════════════════════════════════════════════════════════════════════════════

export function useListDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => invokeAndUnwrap<Department[]>('departments'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useDepartmentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['departments'] });

  const create = useMutation({
    mutationFn: (payload: { name: string; head_id?: string }) =>
      invokeApi('departments', { method: 'POST', body: payload }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; head_id?: string } }) =>
      invokeApi(`departments/${id}`, { method: 'PUT', body: payload }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`departments/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

// ════════════════════════════════════════════════════════════════════════════
//  COMPANY  (company_admin — own company info)
// ════════════════════════════════════════════════════════════════════════════

export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: () => invokeAndUnwrap<Company>('company/info'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompanyMutations() {
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: Partial<Company>) =>
      invokeApi('company/info', { method: 'PATCH', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-info'] }),
  });

  return { update };
}

// ════════════════════════════════════════════════════════════════════════════
//  ADMIN — COMPANIES  (super_admin only)
// ════════════════════════════════════════════════════════════════════════════

export function useListCompanies(
  params: { status?: string; plan_id?: string; page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: ['admin-companies', params],
    queryFn: async () => {
      const res = await invokeApi<ApiSuccessResponse<Company[]>>(
        `admin/companies${qs(params)}`
      );
      return { data: res.data ?? [], meta: res.meta };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetCompany(id: string) {
  return useQuery({
    queryKey: ['admin-company', id],
    queryFn: () => invokeAndUnwrap<Company>(`admin/companies/${id}`),
    enabled: !!id,
  });
}

export function useCompanyAdminMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-companies'] });

  const suspend = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`admin/companies/${id}/suspend`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`admin/companies/${id}/activate`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  const changePlan = useMutation({
    mutationFn: ({ id, plan_id }: { id: string; plan_id: string }) =>
      invokeApi(`admin/companies/${id}/plan`, { method: 'PATCH', body: { plan_id } }),
    onSuccess: invalidate,
  });

  return { suspend, activate, changePlan };
}

// ════════════════════════════════════════════════════════════════════════════
//  ADMIN — PLANS  (super_admin only)
// ════════════════════════════════════════════════════════════════════════════

export function useListPlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => invokeAndUnwrap<Plan[]>('admin/plans'),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePlanMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['plans'] });

  const create = useMutation({
    mutationFn: (payload: Partial<Plan>) =>
      invokeApi('admin/plans', { method: 'POST', body: payload }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Plan> }) =>
      invokeApi(`admin/plans/${id}`, { method: 'PUT', body: payload }),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`admin/plans/${id}/deactivate`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });

  return { create, update, deactivate };
}

// ════════════════════════════════════════════════════════════════════════════
//  ADMIN — DASHBOARD STATS  (super_admin)
// ════════════════════════════════════════════════════════════════════════════

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => invokeAndUnwrap('admin/dashboard'),
    staleTime: 2 * 60 * 1000,
  });
}