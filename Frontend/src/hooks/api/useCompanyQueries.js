/**
 * Company Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAPI } from '../../services/companyService';
import { toast } from '../../utils/toast';

export const useMyCompany = (options = {}) => {
    return useQuery({
        queryKey: ['company', 'me'],
        queryFn: companyAPI.getMyCompany,
        ...options
    });
};

export const useRegisterCompany = () => {
    return useMutation({
        mutationFn: (companyData) => companyAPI.register(companyData),
        onSuccess: () => {
            toast.success('Company registered successfully! You can now login.');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to register company');
        }
    });
};
