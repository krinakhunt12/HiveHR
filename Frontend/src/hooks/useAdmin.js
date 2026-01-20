import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AppLogger from '../utils/AppLogger';

export const useAdmin = () => {
  const [adminData, setAdminData] = useState({
    stats: {
      totalEmployees: 0,
      totalHR: 0,
      activeUsers: 0,
      inactiveUsers: 0
    },
    users: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      AppLogger.info('Synchronizing Admin Workspace data...');

      const { data: users, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const stats = {
        totalEmployees: users.filter(u => u.role === 'employee').length,
        totalHR: users.filter(u => u.role === 'hr').length,
        activeUsers: users.filter(u => u.status === 'active').length,
        inactiveUsers: users.filter(u => u.status === 'inactive').length
      };

      const recentActivity = users.slice(0, 5).map(u => ({
        id: u.id,
        type: 'Event',
        title: `Identity Initialized`,
        description: `${u.full_name} joined as ${u.role?.toUpperCase()}`,
        time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(u.created_at).toLocaleDateString()
      }));

      setAdminData({
        stats,
        users,
        recentActivity
      });
    } catch (err) {
      AppLogger.error('Admin Data Fetch Failure:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      AppLogger.info(`Toggling user status: ${userId} -> ${newStatus}`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (updateError) throw updateError;
      await fetchAdminStats();
      return true;
    } catch (err) {
      AppLogger.error('Status Toggle Failure:', err);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      AppLogger.warn(`Initiated deletion protocol for user: ${userId}`);
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
      await fetchAdminStats();
      return true;
    } catch (err) {
      AppLogger.error('User Termination Failure:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return {
    adminData,
    loading,
    error,
    refreshData: fetchAdminStats,
    toggleUserStatus,
    deleteUser
  };
};