import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hrApi, type Employee, type CompanyPolicy, type AttendanceLog, type Profile, type LeaveRequest } from '../hrApi'
import { useAuthStore } from '@/shared/auth/store'

/**
 * --- PROFILE HOOKS ---
 */
export const useGetMe = () => {
  const { session } = useAuthStore();
  
  return useQuery({ 
    queryKey: ['me', session?.user?.id], 
    queryFn: () => hrApi.getMe(),
    enabled: !!session,
    retry: false
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Profile>) => hrApi.updateMe(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });
}

/**
 * --- EMPLOYEE HOOKS ---
 */
export const useListEmployees = (params: any = {}) => {
  const { session } = useAuthStore();

  return useQuery({ 
    queryKey: ['employees', params], 
    queryFn: () => hrApi.listEmployees(params),
    enabled: !!session,
    retry: false
  })
}

export const useGetEmployee = (id?: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => hrApi.getEmployee(id!),
    enabled: !!id,
    retry: false
  })
}

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => hrApi.createEmployee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => hrApi.updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    }
  })

  const remove = useMutation({
    mutationFn: (id: string) => hrApi.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  })

  return { create, update, remove }
}

/**
 * --- ATTENDANCE HOOKS ---
 */
export const useTodayAttendance = () => {
    const { session } = useAuthStore();
    return useQuery({
        queryKey: ['attendance', 'today', session?.user?.id],
        queryFn: () => hrApi.getTodayAttendance(),
        enabled: !!session,
        retry: false
    })
}

export const useListAttendance = (params: any = {}) => {
  return useQuery({ 
    queryKey: ['attendance', 'list', params], 
    queryFn: async () => {
      // For now, if no detailed list endpoint exists, we just return today's status as a list or empty
      const data = await hrApi.getTodayAttendance();
      return Array.isArray(data) ? data : [data].filter(d => 'id' in d);
    },
    retry: false
  })
}

export const useAttendanceMutations = () => {
  const queryClient = useQueryClient()

  const checkIn = useMutation({
    mutationFn: () => hrApi.checkIn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] })
  })

  const checkOut = useMutation({
    mutationFn: () => hrApi.checkOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] })
  })

  return { checkIn, checkOut }
}

/**
 * --- POLICIES HOOKS ---
 */
export const useListPolicies = (params: any = {}) => {
  return useQuery({ 
    queryKey: ['policies', params], 
    queryFn: () => hrApi.listPolicies(params),
    retry: false
  })
}

export const usePolicyMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => hrApi.createPolicy(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policies'] })
  })

  return { create }
}

/**
 * --- LEAVE HOOKS ---
 */
export const useListLeaves = (params: any = {}) => {
    return useQuery({
        queryKey: ['leaves', params],
        queryFn: () => hrApi.listLeaves(params),
        retry: false
    })
}

export const useLeaveSummary = (year?: number) => {
    return useQuery({
        queryKey: ['leave-summary', year],
        queryFn: () => hrApi.getLeaveSummary(year),
        retry: false
    })
}

export const useLeaveMutations = () => {
    const queryClient = useQueryClient();

    const submit = useMutation({
        mutationFn: (payload: any) => hrApi.submitLeave(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['leave-summary'] });
        }
    });

    const review = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => hrApi.reviewLeave(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['leave-summary'] });
        }
    });

    return { submit, review };
}

export const useHealth = () => useQuery({
  queryKey: ['health'],
  queryFn: async () => ({ ok: true, status: 'healthy', project: 'HiveHR-Real-Roles' }),
  retry: false
})

/**
 * --- EXPORTS RE-EXPORTED FROM HRAPI FOR CONVENIENCE ---
 */
export type { Employee, CompanyPolicy, AttendanceLog, Profile, LeaveRequest };
