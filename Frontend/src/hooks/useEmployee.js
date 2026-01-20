import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabaseAuth } from './useSupabaseAuth';
import AppLogger from '../utils/AppLogger';

export const useEmployee = () => {
    const { user, profile } = useSupabaseAuth();
    const [loading, setLoading] = useState(true);
    const [attendanceToday, setAttendanceToday] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [stats, setStats] = useState({
        presentDays: 0,
        workingHours: 0,
        leaveStatus: 'N/A'
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        AppLogger.info('Fetching employee dashboard data for:', user.id);

        try {
            // 1. Fetch Today's Attendance
            const today = new Date().toISOString().split('T')[0];
            const { data: attData } = await supabase
                .from('attendance')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .single();

            setAttendanceToday(attData);

            // 2. Fetch Leave Balance
            const { data: balance } = await supabase
                .from('leave_balance')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            setLeaveBalance(balance);

            // 3. Fetch Recent Leaves
            const { data: leaves } = await supabase
                .from('leaves')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            setRecentLeaves(leaves || []);

            // 4. Calculate Stats (Simplified for demo)
            const { count: presentCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'present');

            setStats({
                presentDays: presentCount || 0,
                workingHours: (presentCount || 0) * 8.5, // Mock calculation
                leaveStatus: leaves?.[0]?.status || 'No Requests'
            });

        } catch (err) {
            AppLogger.error('Error fetching employee data:', err);
        } finally {
            setLoading(false);
        }
    };

    const clockIn = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('attendance')
                .insert([{
                    user_id: user.id,
                    check_in_time: new Date().toISOString(),
                    status: 'present',
                    date: new Date().toISOString().split('T')[0]
                }]);

            if (error) throw error;
            AppLogger.info('Successfully clocked in');
            await fetchData();
            return true;
        } catch (err) {
            AppLogger.error('Clock in failed:', err);
            return false;
        }
    };

    const clockOut = async () => {
        if (!user || !attendanceToday) return;
        try {
            const { data, error } = await supabase
                .from('attendance')
                .update({
                    check_out_time: new Date().toISOString(),
                })
                .eq('id', attendanceToday.id);

            if (error) throw error;
            AppLogger.info('Successfully clocked out');
            await fetchData();
            return true;
        } catch (err) {
            AppLogger.error('Clock out failed:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    return {
        loading,
        attendanceToday,
        leaveBalance,
        recentLeaves,
        stats,
        clockIn,
        clockOut,
        refresh: fetchData
    };
};
