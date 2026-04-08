import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '@/shared/auth/store'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * --- UNIFIED DATA MODELS ---
 */
export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  designation: string;
  department_id: string | null;
  joined_on: string;
  status: 'active' | 'inactive';
}

export interface CompanyPolicy {
  id: string;
  title: string;
  content: string;
  policy_type: string;
  effective_from: string | null;
  is_active: boolean;
}

export interface AttendanceLog {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: string;
  work_minutes: number;
}

export interface MeProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'company_admin' | 'employee' | null;
}

/**
 * --- AUTHENTICATED DATA ---
 * FIXED: Properly prioritizing metadata role over default Supabase 'authenticated' role
 */
export const useGetMe = () => {
  const { session } = useAuthStore();
  
  return useQuery({ 
    queryKey: ['me', session?.user?.id], 
    queryFn: async () => {
      if (!session) throw new Error('Not logged in')
      
      const user = session.user as any;
      // ALWAYS prioritize user_metadata.role for professional display
      const specializedRole = user.user_metadata?.role || user.app_metadata?.role || (user.role !== 'authenticated' ? user.role : 'employee');

      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.full_name,
        role: specializedRole
      } as MeProfile
    },
    enabled: !!session,
    retry: false
  })
}

/**
 * --- EMPLOYEE DATA (SECURE EDGE ACCESS) ---
 */
export const useListEmployees = (companyId?: string) => {
  const { session } = useAuthStore();

  return useQuery({ 
    queryKey: ['employees', companyId], 
    queryFn: async () => {
      if (!companyId || !session?.access_token) return []
      
      const { data, error } = await supabase.functions.invoke(`employee?company_id=${companyId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
        }
      })
      
      if (error) throw error
      return data as Employee[]
    },
    enabled: !!companyId && !!session?.access_token,
    retry: false
  })
}

/**
 * --- CORE MANAGEMENT MUTATIONS (Edge Function Powered) ---
 */
export const useEmployeeMutations = () => {
  const queryClient = useQueryClient()
  const { session } = useAuthStore();

  const create = useMutation({
    mutationFn: async (payload: any) => {
      if (!session?.access_token) throw new Error('Unauthorized')
      const { data, error } = await supabase.functions.invoke('employee', {
        method: 'POST',
        body: payload,
        headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
        }
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    retry: false
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.access_token) throw new Error('Unauthorized')
      const { data, error } = await supabase.functions.invoke('employee', {
        method: 'DELETE',
        body: { id },
        headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey
        }
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    retry: false
  })

  return { create, remove }
}

/**
 * --- POLICIES AND ATTENDANCE (Mocks) ---
 */
export const useListPolicies = (_companyId?: string) => useQuery({ 
  queryKey: ['policies'], 
  queryFn: async () => [
    { id: '1', title: 'Work From Home Policy', content: 'Detailed remote work guidelines', policy_type: 'Compliance', effective_from: '2026-01-01', is_active: true }
  ] as CompanyPolicy[],
  retry: false
})

export const useListAttendance = (_params?: any) => useQuery({ 
  queryKey: ['attendance'], 
  queryFn: async () => [] as AttendanceLog[],
  retry: false
})

export const usePolicyMutations = () => ({
  create: { mutateAsync: async (_p: any) => {}, isPending: false },
  remove: { mutateAsync: async (_id: string) => {}, isPending: false }
})

export const useAttendanceMutations = () => ({
  checkIn: { mutateAsync: async (_p: any) => {}, isPending: false },
  checkOut: { mutateAsync: async (_id: string) => {}, isPending: false }
})

export const useHealth = () => useQuery({
  queryKey: ['health'],
  queryFn: async () => ({ status: 'healthy', project: 'HiveHR-Real-Roles' }),
  retry: false
})
