import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  hrApi, 
  type Employee, 
  type AttendanceLog, 
  type CompanyPolicy, 
  type EmployeeCreateInput, 
  type EmployeeUpdateInput, 
  type PolicyCreateInput, 
  type PolicyUpdateInput, 
  type AttendanceFilter, 
  type MeProfile 
} from '@/shared/api/hrApi'
import { useToast } from '@/shared/ui/toast'

/**
 * --- PROFILE HOOKS ---
 */

export function useGetMe() {
  return useQuery<MeProfile, Error>({ 
    queryKey: ['me'], 
    queryFn: () => hrApi.getMe().then((r) => r.data)
  })
}

export function useHealth() {
  return useQuery({ 
    queryKey: ['health'], 
    queryFn: () => hrApi.getHealth() 
  })
}

/**
 * --- EMPLOYEE HOOKS ---
 */

export function useListEmployees(companyId?: string) {
  const toast = useToast()

  return useQuery<Employee[], Error>({
    queryKey: ['employees', companyId ?? 'all'],
    queryFn: async () => {
      try {
        const res = await hrApi.listEmployees(companyId)
        return res.data
      } catch (err: any) {
        toast({ 
          title: 'Failed to load employees', 
          description: err?.message ?? 'Server error', 
          type: 'error' 
        })
        throw err
      }
    }
  })
}

export function useGetEmployee(employeeId?: string) {
  return useQuery<Employee | null, Error>({
    queryKey: ['employee', employeeId],
    queryFn: () => (employeeId ? hrApi.getEmployee(employeeId).then((r) => r.data) : Promise.resolve(null)),
    enabled: !!employeeId,
  })
}

export function useEmployeeMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const create = useMutation({
    mutationFn: (input: EmployeeCreateInput) => hrApi.createEmployee(input).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: 'Employee created', description: data?.full_name ?? 'Success', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Create failed', description: err?.message ?? 'Could not create employee', type: 'error' }),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeUpdateInput }) =>
      hrApi.updateEmployee(id, input).then((r) => r.data),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['employee', vars.id] })
      toast({ title: 'Employee updated', description: data?.full_name ?? 'Success', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Update failed', description: err?.message ?? 'Could not update employee', type: 'error' }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => hrApi.deleteEmployee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: 'Employee deleted', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Delete failed', description: err?.message ?? 'Could not delete employee', type: 'error' }),
  })

  return { create, update, remove }
}

/**
 * --- ATTENDANCE HOOKS ---
 */

export function useListAttendance(filter: AttendanceFilter = {}) {
  const toast = useToast()

  return useQuery<AttendanceLog[], Error>({
    queryKey: ['attendance', filter],
    queryFn: async () => {
      try {
        const res = await hrApi.listAttendance(filter)
        return res.data
      } catch (err: any) {
        toast({ 
          title: 'Failed to load attendance', 
          description: err?.message ?? 'Server error', 
          type: 'error' 
        })
        throw err
      }
    }
  })
}

export function useAttendanceMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const checkIn = useMutation({
    mutationFn: (input: { employee_id: string; company_id: string; attendance_date?: string }) =>
      hrApi.checkIn(input).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      toast({ title: 'Checked in', description: `Checked in at ${data.check_in_at ?? ''}`, type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Check-in failed', description: err?.message ?? 'Unable to check in', type: 'error' }),
  })

  const checkOut = useMutation({
    mutationFn: (input: { employee_id: string; attendance_date?: string }) =>
      hrApi.checkOut(input).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      toast({ title: 'Checked out', description: `Checked out at ${data.check_out_at ?? ''}`, type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Check-out failed', description: err?.message ?? 'Unable to check out', type: 'error' }),
  })

  return { checkIn, checkOut }
}

/**
 * --- POLICY HOOKS ---
 */

export function useListPolicies(companyId?: string) {
  const toast = useToast()

  return useQuery<CompanyPolicy[], Error>({
    queryKey: ['policies', companyId],
    queryFn: async () => {
       if (!companyId) return []
       try {
         const res = await hrApi.listPolicies(companyId)
         return res.data
       } catch (err: any) {
         toast({ title: 'Failed to load policies', description: err?.message ?? 'Server error', type: 'error' })
         throw err
       }
    },
    enabled: !!companyId,
  })
}

export function usePolicyMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const create = useMutation({
    mutationFn: (input: PolicyCreateInput) => hrApi.createPolicy(input).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['policies'] })
      toast({ title: 'Policy created', description: data?.title ?? 'Success', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Create failed', description: err?.message ?? 'Could not create policy', type: 'error' }),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PolicyUpdateInput }) =>
      hrApi.updatePolicy(id, input).then((r) => r.data),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['policies'] })
      qc.invalidateQueries({ queryKey: ['policy', vars.id] })
      toast({ title: 'Policy updated', description: data?.title ?? 'Success', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Update failed', description: err?.message ?? 'Could not update policy', type: 'error' }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => hrApi.deletePolicy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies'] })
      toast({ title: 'Policy deleted', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Delete failed', description: err?.message ?? 'Could not delete policy', type: 'error' }),
  })

  return { create, update, remove }
}

export default {
  useGetMe,
  useListEmployees,
  useGetEmployee,
  useListAttendance,
  useListPolicies,
  useEmployeeMutations,
  useAttendanceMutations,
  usePolicyMutations,
}
