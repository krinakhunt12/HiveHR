import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import AppLogger from '../../utils/AppLogger'

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            AppLogger.info('Fetching Admin Stats via React Query')
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            const stats = {
                totalEmployees: users.filter(u => u.role === 'employee').length,
                totalHR: users.filter(u => u.role === 'hr').length,
                activeUsers: users.filter(u => u.status === 'active').length,
                inactiveUsers: users.filter(u => u.status === 'inactive').length
            }

            const recentActivity = users.slice(0, 5).map(u => ({
                id: u.id,
                type: 'Event',
                title: `Identity Initialized`,
                description: `${u.full_name} joined as ${u.role?.toUpperCase()}`,
                time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(u.created_at).toLocaleDateString()
            }))

            return { stats, users, recentActivity }
        },
        staleTime: 300000, // 5 min
    })
}

export const useUsersByRole = (role) => {
    return useQuery({
        queryKey: ['users', role],
        queryFn: async () => {
            AppLogger.info(`Fetching ${role} users via React Query`)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', role)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
        staleTime: 60000,
    })
}

export const useToggleUserStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ userId, currentStatus }) => {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
            AppLogger.info(`Toggling status: ${userId} -> ${newStatus}`)
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId)

            if (error) throw error
            return { userId, newStatus }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['adminStats'] })
        }
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (userId) => {
            AppLogger.warn(`Deleting user: ${userId}`)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) throw error
            return userId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['adminStats'] })
        }
    })
}

export const useOnboardUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ email, password, profileData }) => {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

            // Using temp client to avoid session override
            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false }
            })

            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: profileData.full_name } }
            })

            if (authError) throw authError

            const { error: profileError } = await supabase.from('profiles').insert([{
                id: authData.user.id,
                email,
                ...profileData,
                status: 'active'
            }])

            if (profileError) throw profileError
            return authData.user
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['adminStats'] })
        }
    })
}
