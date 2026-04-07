import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hrApi, type Employee, type AttendanceLog, type CompanyPolicy, type EmployeeCreateInput, type EmployeeUpdateInput, type PolicyCreateInput, type PolicyUpdateInput, type AttendanceFilter } from '@/shared/api/hrApi'
import { useToast } from '@/shared/ui/toast'

export function useGetMe() {
  return useQuery(['me'], () => hrApi.getMe().then((r) => r.data))
}

export function useHealth() {
  return useQuery(['health'], () => hrApi.getHealth())
}

export function useListEmployees(companyId?: string) {
  return useQuery(['employees', companyId ?? 'all'], () => hrApi.listEmployees(companyId).then((r) => r.data), {
    keepPreviousData: true,
    onError: (err: any) => {
      try { useToast()({ title: 'Failed to load employees', description: err?.message ?? 'Server error', type: 'error' }) } catch {}
    },
  })
}

export function useGetEmployee(employeeId?: string) {
  return useQuery(['employee', employeeId], () => (employeeId ? hrApi.getEmployee(employeeId).then((r) => r.data) : Promise.resolve(null)), {
    enabled: !!employeeId,
  })
}

export function useListAttendance(filter: AttendanceFilter = {}) {
  return useQuery(['attendance', filter], () => hrApi.listAttendance(filter).then((r) => r.data), {
    onError: (err: any) => {
      try { useToast()({ title: 'Failed to load attendance', description: err?.message ?? 'Server error', type: 'error' }) } catch {}
    },
  })
}

export function useListPolicies(companyId?: string) {
  return useQuery(['policies', companyId], () => (companyId ? hrApi.listPolicies(companyId).then((r) => r.data) : Promise.resolve([])), {
    enabled: !!companyId,
    onError: (err: any) => {
      try { useToast()({ title: 'Failed to load policies', description: err?.message ?? 'Server error', type: 'error' }) } catch {}
    },
  })
}

export function useEmployeeMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const create = useMutation((input: EmployeeCreateInput) => hrApi.createEmployee(input).then((r) => r.data), {
    onSuccess: (data) => {
      qc.invalidateQueries(['employees'])
      toast({ title: 'Employee created', description: data?.full_name ?? 'Employee created', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Create failed', description: err?.message ?? 'Could not create employee', type: 'error' }),
  })

  const update = useMutation(({ id, input }: { id: string; input: EmployeeUpdateInput }) =>
    hrApi.updateEmployee(id, input).then((r) => r.data),
    {
      onSuccess: (data, vars) => {
        qc.invalidateQueries(['employees'])
        qc.invalidateQueries(['employee', vars.id])
        toast({ title: 'Employee updated', description: data?.full_name ?? 'Employee updated', type: 'success' })
      },
      onError: (err: any) => toast({ title: 'Update failed', description: err?.message ?? 'Could not update employee', type: 'error' }),
    },
  )

  const remove = useMutation((id: string) => hrApi.deleteEmployee(id), {
    onSuccess: () => {
      qc.invalidateQueries(['employees'])
      toast({ title: 'Employee deleted', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Delete failed', description: err?.message ?? 'Could not delete employee', type: 'error' }),
  })

  return { create, update, remove }
}

export function useAttendanceMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const checkIn = useMutation((input: { employee_id: string; company_id: string; attendance_date?: string }) =>
    hrApi.checkIn(input).then((r) => r.data),
    {
      onSuccess: (data) => {
        qc.invalidateQueries(['attendance'])
        toast({ title: 'Checked in', description: `Checked in at ${data.check_in_at ?? ''}`, type: 'success' })
      },
      onError: (err: any) => toast({ title: 'Check-in failed', description: err?.message ?? 'Unable to check in', type: 'error' }),
    },
  )

  const checkOut = useMutation((input: { employee_id: string; attendance_date?: string }) =>
    hrApi.checkOut(input).then((r) => r.data),
    {
      onSuccess: (data) => {
        qc.invalidateQueries(['attendance'])
        toast({ title: 'Checked out', description: `Checked out at ${data.check_out_at ?? ''}`, type: 'success' })
      },
      onError: (err: any) => toast({ title: 'Check-out failed', description: err?.message ?? 'Unable to check out', type: 'error' }),
    },
  )

  return { checkIn, checkOut }
}

export function usePolicyMutations() {
  const qc = useQueryClient()
  const toast = useToast()

  const create = useMutation((input: PolicyCreateInput) => hrApi.createPolicy(input).then((r) => r.data), {
    onSuccess: (data) => {
      qc.invalidateQueries(['policies'])
      toast({ title: 'Policy created', description: data?.title ?? 'Policy created', type: 'success' })
    },
    onError: (err: any) => toast({ title: 'Create failed', description: err?.message ?? 'Could not create policy', type: 'error' }),
  })

  const update = useMutation(({ id, input }: { id: string; input: PolicyUpdateInput }) =>
    hrApi.updatePolicy(id, input).then((r) => r.data),
    {
      onSuccess: (data, vars) => {
        qc.invalidateQueries(['policies', vars.id])
        toast({ title: 'Policy updated', description: data?.title ?? 'Policy updated', type: 'success' })
      },
      onError: (err: any) => toast({ title: 'Update failed', description: err?.message ?? 'Could not update policy', type: 'error' }),
    },
  )

  const remove = useMutation((id: string) => hrApi.deletePolicy(id), {
    onSuccess: () => {
      qc.invalidateQueries(['policies'])
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
