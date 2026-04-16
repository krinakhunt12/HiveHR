import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  employeeApi, 
  companyAdminApi, 
  mainAdminApi,
  type Employee, 
  type CompanyPolicy, 
  type AttendanceLog, 
  type Profile, 
  type LeaveRequest,
  type TaskDirective
} from '../hrApi'
import { useAuthStore } from '@/shared/auth/store'

/**
 * --- PROFILE HOOKS (Employee & Admin) ---
 */
export const useGetMe = () => {
  const { session } = useAuthStore();
  
  return useQuery({ 
    queryKey: ['me', session?.user?.id], 
    queryFn: () => employeeApi.getMe(),
    enabled: !!session,
    retry: false
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Profile>) => employeeApi.updateMe(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });
}

/**
 * --- EMPLOYEE MANAGEMENT HOOKS (Company Admin) ---
 */
export const useListEmployees = (params: any = {}) => {
  const { session } = useAuthStore();

  return useQuery({ 
    queryKey: ['employees', params], 
    queryFn: () => companyAdminApi.listEmployees(params),
    enabled: !!session,
    retry: false
  })
}

export const useGetEmployee = (id?: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => companyAdminApi.getEmployee(id!),
    enabled: !!id,
    retry: false
  })
}

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => companyAdminApi.createEmployee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => companyAdminApi.updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    }
  })

  const remove = useMutation({
    mutationFn: (id: string) => companyAdminApi.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  })

  return { create, update, remove }
}

/**
 * --- ATTENDANCE HOOKS (Employee) ---
 */
export const useTodayAttendance = () => {
    const { session } = useAuthStore();
    return useQuery({
        queryKey: ['attendance', 'today', session?.user?.id],
        queryFn: () => employeeApi.getTodayAttendance(),
        enabled: !!session,
        retry: false
    })
}

export const useListAttendance = (params: any = {}) => {
  return useQuery({ 
    queryKey: ['attendance', 'list', params], 
    queryFn: async () => {
      const data = await employeeApi.getTodayAttendance();
      return Array.isArray(data) ? data : [data].filter(d => 'id' in d);
    },
    retry: false
  })
}

export const useAttendanceMutations = () => {
  const queryClient = useQueryClient()

  const checkIn = useMutation({
    mutationFn: () => employeeApi.checkIn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] })
  })

  const checkOut = useMutation({
    mutationFn: (id: string) => employeeApi.checkOut(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] })
  })

  return { checkIn, checkOut }
}

/**
 * --- POLICIES HOOKS ---
 */
export const useListPolicies = (params: any = {}) => {
  // If params includes search or include_inactive, use companyAdminApi
  const api = (params.include_inactive || params.company_id) ? companyAdminApi : employeeApi;
  
  return useQuery({ 
    queryKey: ['policies', params], 
    queryFn: () => api.listPolicies(params),
    retry: false
  })
}

export const usePolicyMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => companyAdminApi.createPolicy(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policies'] })
  })

  return { create }
}

/**
 * --- LEAVE HOOKS ---
 */
export const useListLeaves = (params: any = {}) => {
    // If employee_id is present, it's likely an admin viewing or employee viewing their own
    // but the endpoints are similar. We'll use employeeApi as default unless specified.
    const api = params.employee_id ? companyAdminApi : employeeApi;
    return useQuery({
        queryKey: ['leaves', params],
        queryFn: () => api.listLeaves(params),
        retry: false
    })
}

export const useLeaveSummary = (year?: number) => {
    return useQuery({
        queryKey: ['leave-summary', year],
        queryFn: () => employeeApi.getLeaveSummary(year),
        retry: false
    })
}

export const useLeaveMutations = () => {
    const queryClient = useQueryClient();

    const submit = useMutation({
        mutationFn: (payload: any) => employeeApi.submitLeave(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['leave-summary'] });
        }
    });

    const review = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => companyAdminApi.reviewLeave(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['leave-summary'] });
        }
    });

    return { submit, review };
}

/**
 * --- TASK (DIRECTIVE) HOOKS ---
 */
export const useListTasks = (params: any = {}, isAdmin: boolean = false) => {
  const { session } = useAuthStore();
  const api = isAdmin ? companyAdminApi : employeeApi;

  return useQuery({
    queryKey: ['tasks', params, isAdmin],
    queryFn: () => api.listTasks(params),
    enabled: !!session,
    retry: false
  });
}

export const useTaskMutations = (isAdmin: boolean = false) => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: Partial<TaskDirective>) => companyAdminApi.createTask(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskDirective> }) => 
      isAdmin ? companyAdminApi.updateTask(id, payload) : employeeApi.updateTaskStatus(id, payload.status!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const remove = useMutation({
    mutationFn: (id: string) => companyAdminApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  return { create, update, remove };
}

/**
 * --- MAIN ADMIN HOOKS ---
 */
export const useListAllEmployees = (params: any = {}) => {
  return useQuery({
    queryKey: ['all-employees', params],
    queryFn: () => mainAdminApi.listAllEmployees(params),
    retry: false
  })
}

export const useHealth = () => useQuery({
  queryKey: ['health'],
  queryFn: async () => ({ ok: true, status: 'healthy', project: 'HiveHR-Real-Roles' }),
  retry: false
})

/**
 * --- EXPORTS RE-EXPORTED FROM HRAPI FOR CONVENIENCE ---
 */
export type { Employee, CompanyPolicy, AttendanceLog, Profile, LeaveRequest, TaskDirective };
