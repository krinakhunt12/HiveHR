import { useState, useEffect } from 'react';
import { mockLeaves } from '../data/mockLeaves';

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLeaves(mockLeaves);
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const applyForLeave = async (leaveData) => {
    const newLeave = {
      id: Date.now().toString(),
      employeeId: 'current-user',
      employeeName: 'Current User',
      employeeEmail: 'user@hivehr.com',
      type: leaveData.type,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      reason: leaveData.reason,
      emergencyContact: leaveData.emergencyContact,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setLeaves(prev => [newLeave, ...prev]);
    return newLeave;
  };

  const approveLeave = async (leaveId) => {
    setLeaves(prev =>
      prev.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'approved' } : leave
      )
    );
  };

  const rejectLeave = async (leaveId) => {
    setLeaves(prev =>
      prev.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
      )
    );
  };

  return {
    leaves,
    loading,
    applyForLeave,
    approveLeave,
    rejectLeave,
  };
};