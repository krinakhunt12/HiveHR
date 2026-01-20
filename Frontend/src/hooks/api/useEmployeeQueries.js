import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import AppLogger from '../../utils/AppLogger'

export const useEmployeeStats = (userId) => {
    return useQuery({
        queryKey: ['employeeStats', userId],
        queryFn: async () => {
            if (!userId) return null
            AppLogger.info(`Fetching employee dashboard queries for: ${userId}`)

            const today = new Date().toISOString().split('T')[0]

            // Parallel fetch using Promise.all
            const [attendanceRes, balanceRes, leavesRes, countRes] = await Promise.all([
                supabase.from('attendance').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
                supabase.from('leave_balance').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('leaves').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
                supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'present')
            ])

            if (attendanceRes.error) throw attendanceRes.error

            const recentLeaves = leavesRes.data || []

            return {
                attendanceToday: attendanceRes.data,
                leaveBalance: balanceRes.data,
                recentLeaves: recentLeaves,
                stats: {
                    presentDays: countRes.count || 0,
                    workingHours: (countRes.count || 0) * 8.5,
                    leaveStatus: recentLeaves[0]?.status || 'NO_REQUESTS'
                }
            }
        },
        enabled: !!userId,
        staleTime: 60000,
    })
}

export const useClockIn = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (userId) => {
            AppLogger.info(`Executing Clock-In protocol for: ${userId}`)
            const { data, error } = await supabase
                .from('attendance')
                .insert([{
                    user_id: userId,
                    check_in_time: new Date().toISOString(),
                    status: 'present',
                    date: new Date().toISOString().split('T')[0]
                }]).select().single()

            if (error) throw error
            return data
        },
        onSuccess: (data, userId) => {
            queryClient.invalidateQueries({ queryKey: ['employeeStats', userId] })
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        }
    })
}

export const useClockOut = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ attendanceId, userId }) => {
            AppLogger.info(`Executing Clock-Out protocol for record: ${attendanceId}`)
            const { data, error } = await supabase
                .from('attendance')
                .update({
                    check_out_time: new Date().toISOString(),
                })
                .eq('id', attendanceId).select().single()

            if (error) throw error
            return data
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employeeStats', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        }
    })
}
