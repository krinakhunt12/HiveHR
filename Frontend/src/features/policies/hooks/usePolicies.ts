import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeAndUnwrap } from '@/shared/api/baseApi';
import toast from 'react-hot-toast';

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
      invokeAndUnwrap(`documents/${id}/acknowledge`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy acknowledged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to acknowledge policy');
    }
  });

  const create = useMutation({
    mutationFn: (payload: Partial<CompanyPolicy>) =>
      invokeAndUnwrap('documents', { method: 'POST', body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create policy');
    }
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CompanyPolicy> }) =>
      invokeAndUnwrap(`documents/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
      qc.invalidateQueries({ queryKey: ['company-policy'] });
      toast.success('Policy updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update policy');
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      invokeAndUnwrap(`documents/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete policy');
    }
  });

  return { acknowledge, create, update, remove };
}
