import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import AppLogger from '../../utils/AppLogger'

export const useLeavesQuery = () => {
    return useQuery({
        queryKey: ['leaves'],
        queryFn: async () => {
            AppLogger.info('Decrypting leave records via React Query...')
            const { data, error } = await supabase
                .from('leaves')
                .select(`
                    *,
                    profiles:user_id (full_name, employee_id)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            return data.map(leave => ({
                ...leave,
                user_name: leave.profiles?.full_name || 'Unknown User',
                emp_id: leave.profiles?.employee_id || 'N/A'
            }))
        },
        staleTime: 60000,
    })
}

export const useUpdateLeaveStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leaveId, status }) => {
            AppLogger.info(`Updating leave ${leaveId} to ${status}`)
            const { error } = await supabase
                .from('leaves')
                .update({ status })
                .eq('id', leaveId)

            if (error) throw error
            return { leaveId, status }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] })
            queryClient.invalidateQueries({ queryKey: ['hrStats'] })
        }
    })
}
