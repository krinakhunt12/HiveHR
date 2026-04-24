import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeApi, invokeAndUnwrap } from '@/shared/api/baseApi';

export interface CompanyPolicy {
  id: string;
  company_id: string;
  title: string;
  content: string;
  category: string;
  is_mandatory: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  acknowledgements?: { count: number }[];
}

export function usePolicies() {
  return useQuery({
    queryKey: ['company-policies'],
    queryFn: () => invokeAndUnwrap<CompanyPolicy[]>('documents'),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePolicyDetail(id: string) {
  return useQuery({
    queryKey: ['company-policy', id],
    queryFn: () => invokeAndUnwrap<CompanyPolicy>(`documents/${id}`),
    enabled: !!id,
  });
}

export function usePolicyMutations() {
  const qc = useQueryClient();

  const acknowledge = useMutation({
    mutationFn: (id: string) => 
      invokeApi(`documents/${id}/acknowledge`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
    }
  });

  const create = useMutation({
    mutationFn: (payload: Partial<CompanyPolicy>) =>
      invokeApi('documents', { method: 'POST', body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
    }
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CompanyPolicy> }) =>
      invokeApi(`documents/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
      qc.invalidateQueries({ queryKey: ['company-policy'] });
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeApi(`documents/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
    }
  });

  return { acknowledge, create, update, remove };
}
