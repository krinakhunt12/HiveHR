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
import { queryKeys } from '../queryKeys'

/**
 * --- PROFILE HOOKS (Employee & Admin) ---
 */
export const useGetMe = () => {
  const { session } = useAuthStore();
  
  return useQuery({ 
    queryKey: queryKeys.auth.me(session?.user?.id), 
    queryFn: () => employeeApi.getMe(),
    enabled: !!session,
    retry: false
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Profile>) => employeeApi.updateMe(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth'] })
  });
}

/**
 * --- COMPANY HOOKS (Company Admin) ---
 */
export const useCompanyInfo = () => {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ['company', 'info'],
    queryFn: async () => {
      const res = await companyAdminApi.getCompanyInfo();
      return res.data;
    },
    enabled: !!session && session?.user?.role === 'company_admin',
    retry: false
  });
}

export const useUpdateCompanyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => companyAdminApi.updateCompanyInfo(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company', 'info'] })
  });
}

/**
 * --- EMPLOYEE MANAGEMENT HOOKS (Company Admin) ---
 */
export const useListEmployees = (params: any = {}) => {
  const { session } = useAuthStore();

  return useQuery({ 
    queryKey: queryKeys.employees.list(params), 
    queryFn: async () => {
      const res = await companyAdminApi.listEmployees(params);
      return res.data;
    },
    enabled: !!session,
    retry: false
  })
}

export const useGetEmployee = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id!),
    queryFn: async () => {
       const res = await companyAdminApi.getEmployee(id!);
       return res.data;
    },
    enabled: !!id,
    retry: false
  })
}

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => companyAdminApi.createEmployee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() })
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => companyAdminApi.updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
    }
  })

  const remove = useMutation({
    mutationFn: (id: string) => companyAdminApi.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() })
  })

  return { create, update, remove }
}

/**
 * --- ATTENDANCE HOOKS (Employee) ---
 */
export const useTodayAttendance = () => {
    const { session } = useAuthStore();
    return useQuery({
        queryKey: queryKeys.attendance.today(session?.user?.id),
        queryFn: () => employeeApi.getTodayAttendance(),
        enabled: !!session,
        retry: false
    })
}

export const useListAttendance = (params: any = {}) => {
  return useQuery({ 
    queryKey: queryKeys.attendance.list(params), 
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
    queryKey: queryKeys.policies.list(params), 
    queryFn: async () => {
      const res = await api.listPolicies(params);
      return res.data;
    },
    retry: false
  })
}

export const usePolicyMutations = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: any) => companyAdminApi.createPolicy(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.policies.list() })
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companyAdminApi.updatePolicy(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.policies.list() })
  })

  const remove = useMutation({
    mutationFn: (id: string) => companyAdminApi.deletePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.policies.list() })
  })

  return { create, update, remove }
}

/**
 * --- LEAVE HOOKS ---
 */
export const useListLeaves = (params: any = {}) => {
    const api = params.employee_id ? companyAdminApi : employeeApi;
    return useQuery({
        queryKey: queryKeys.leaves.list(params),
        queryFn: async () => {
          const res = await api.listLeaves(params);
          return res.data;
        },
        retry: false
    })
}

export const useLeaveSummary = (year?: number) => {
    return useQuery({
        queryKey: queryKeys.leaves.summary(year),
        queryFn: async () => {
           const res = await employeeApi.getLeaveSummary(year);
           return res.data;
        },
        retry: false
    })
}

export const useLeaveMutations = () => {
    const queryClient = useQueryClient();

    const submit = useMutation({
        mutationFn: (payload: any) => employeeApi.submitLeave(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        }
    });

    const review = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => companyAdminApi.reviewLeave(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        }
    });

    return { submit, review };
}

export const useLeaveConfigurations = () => {
    return useQuery({
        queryKey: queryKeys.leaves.configs(),
        queryFn: async () => {
          const res = await employeeApi.getLeaveConfigurations();
          return res.data;
        },
        retry: false
    });
}

export const useLeaveConfigMutations = () => {
    const queryClient = useQueryClient();
    const update = useMutation({
        mutationFn: (configs: any[]) => companyAdminApi.updateLeaveConfigurations(configs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leaves.configs() });
        }
    });
    return { update };
}

/**
 * --- TASK (DIRECTIVE) HOOKS ---
 */
export const useListTasks = (params: any = {}, isAdmin: boolean = false) => {
  const { session } = useAuthStore();
  const api = isAdmin ? companyAdminApi : employeeApi;

  return useQuery({
    queryKey: queryKeys.tasks.list(params, isAdmin),
    queryFn: async () => {
      const res = await api.listTasks(params);
      return res.data;
    },
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
    queryKey: queryKeys.employees.all(params),
    queryFn: async () => {
      const res = await mainAdminApi.listAllEmployees(params);
      return res.data;
    },
    retry: false
  })
}

export const useHealth = () => useQuery({
  queryKey: queryKeys.system.health(),
  queryFn: async () => ({ ok: true, status: 'healthy', project: 'HiveHR-Real-Roles' }),
  retry: false
})

/**
 * --- EXPORTS RE-EXPORTED FROM HRAPI FOR CONVENIENCE ---
 */
export type { Employee, CompanyPolicy, AttendanceLog, Profile, LeaveRequest, TaskDirective };
