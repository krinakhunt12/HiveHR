import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import AppLogger from '../../utils/AppLogger'

export const useAttendanceQuery = () => {
    return useQuery({
        queryKey: ['attendance'],
        queryFn: async () => {
            AppLogger.info('Scanning Biometric Ledger via React Query...')
            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    *,
                    profiles:user_id (full_name, employee_id)
                `)
                .order('date', { ascending: false })

            if (error) throw error

            return data
        },
        staleTime: 60000,
    })
}
