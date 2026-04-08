import { useMutation, useQuery } from '@tanstack/react-query'

/**
 * --- IN-LINED TYPES ---
 */
export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  designation: string;
  joined_on: string;
  status: 'active' | 'inactive';
}

export interface CompanyPolicy {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
}

export interface MeProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'company_admin' | 'employee' | null;
}

/**
 * --- STATIC MOCK DATA ---
 */
const MOCK_ME: MeProfile = {
  id: 'me-123',
  email: 'krina@hivehr.com',
  full_name: 'Krina Khunt',
  role: 'company_admin'
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', employee_code: 'EMP001', full_name: 'Alex Johnson', designation: 'Developer', joined_on: '2023-01', status: 'active' },
  { id: '2', employee_code: 'EMP002', full_name: 'Sarah Smith', designation: 'Designer', joined_on: '2023-02', status: 'active' },
  { id: '3', employee_code: 'EMP003', full_name: 'Ryan White', designation: 'Project Manager', joined_on: '2023-03', status: 'active' },
]

const MOCK_POLICIES: CompanyPolicy[] = [
  { id: 'p1', title: 'Work from Home', content: 'Guidelines for remote work...', is_active: true },
  { id: 'p2', title: 'Annual Leave', content: 'Holiday entitlement rules...', is_active: true }
]

/**
 * --- STATIC HOOKS ---
 */
export const useGetMe = () => useQuery({ queryKey: ['me'], queryFn: async () => MOCK_ME })
export const useListEmployees = () => useQuery({ queryKey: ['employees'], queryFn: async () => MOCK_EMPLOYEES })
export const useListPolicies = () => useQuery({ queryKey: ['policies'], queryFn: async () => MOCK_POLICIES })
export const useListAttendance = () => useQuery({ queryKey: ['attendance'], queryFn: async () => [] })

export const useEmployeeMutations = () => ({
  create: { mutateAsync: async () => {}, isPending: false },
  update: { mutateAsync: async () => {}, isPending: false },
  remove: { mutateAsync: async () => {}, isPending: false }
})

export const usePolicyMutations = () => ({
  create: { mutateAsync: async () => {}, isPending: false },
  update: { mutateAsync: async () => {}, isPending: false },
  remove: { mutateAsync: async () => {}, isPending: false }
})

export default {
  useGetMe,
  useListEmployees,
  useListPolicies,
  useListAttendance,
  useEmployeeMutations,
  usePolicyMutations
}
