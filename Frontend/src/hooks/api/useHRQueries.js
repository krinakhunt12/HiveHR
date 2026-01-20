import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import AppLogger from '../../utils/AppLogger'

export const useHRStats = () => {
    return useQuery({
        queryKey: ['hrStats'],
        queryFn: async () => {
            AppLogger.info('Decrypting HR Workforce Intelligence via React Query...')
            const today = new Date().toISOString().split('T')[0]
            const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

            // Fetch counts in parallel
            const [empCount, attendanceCount, pendingCount, approvedCount] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee'),
                supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today),
                supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', firstDayOfMonth)
            ])

            return {
                totalEmployees: empCount.count || 0,
                presentToday: attendanceCount.count || 0,
                pendingLeaves: pendingCount.count || 0,
                approvedLeaves: approvedCount.count || 0,
            }
        },
        staleTime: 60000, // 1 minute
    })
}

export const usePeople = () => {
    return useQuery({
        queryKey: ['people'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'employee')
                .order('full_name')

            if (error) throw error
            return data
        }
    })
}
