import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AppLogger from '../utils/AppLogger';

export const useHR = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchHRDashboardData = async () => {
        try {
            setLoading(true);
            AppLogger.info('Decrypting HR Workforce Intelligence...');

            const today = new Date().toISOString().split('T')[0];

            // 1. Total Employees
            const { count: empCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'employee');

            // 2. Present Today
            const { count: attendanceCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('date', today);

            // 3. Pending Leaves
            const { count: pendingCount } = await supabase
                .from('leaves')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 4. Approved Leaves (current month)
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const { count: approvedCount } = await supabase
                .from('leaves')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
                .gte('created_at', firstDay);

            setStats({
                totalEmployees: empCount || 0,
                presentToday: attendanceCount || 0,
                pendingLeaves: pendingCount || 0,
                approvedLeaves: approvedCount || 0,
            });
        } catch (error) {
            AppLogger.error('HR Intelligence Fetch Failure:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHRDashboardData();
    }, []);

    return {
        stats,
        loading,
        refreshStats: fetchHRDashboardData,
    };
};
