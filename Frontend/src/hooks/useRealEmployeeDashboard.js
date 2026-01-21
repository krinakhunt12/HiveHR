/**
 * Real Employee Dashboard Hook
 * Aggregates multiple API calls using TanStack Query
 */

import { useCurrentUser } from './api/useAuthQueries';
import { useEmployee, useEmployeeStats } from './api/useEmployeeQueries';
import { useMyAttendance, useTodayAttendance } from './api/useAttendanceQueries';
import { useMyLeaves, useLeaveBalance } from './api/useLeaveQueries';
import { useHolidays } from './api/useMiscQueries';

export const useRealEmployeeDashboard = () => {
    const { data: currentUserData, isLoading: authLoading } = useCurrentUser();
    const userId = currentUserData?.data?.user?.id;
    const profile = currentUserData?.data?.profile;

    // Parallel queries
    const employeeQuery = useEmployee(userId, { enabled: !!userId });
    const statsQuery = useEmployeeStats(userId, { enabled: !!userId });
    const todayAttendanceQuery = useTodayAttendance({ enabled: !!userId });
    const myLeavesQuery = useMyLeaves({ limit: 5 }, { enabled: !!userId });
    const leaveBalanceQuery = useLeaveBalance(new Date().getFullYear(), { enabled: !!userId });
    const holidaysQuery = useHolidays();

    const isLoading = authLoading ||
        employeeQuery.isLoading ||
        statsQuery.isLoading ||
        todayAttendanceQuery.isLoading ||
        myLeavesQuery.isLoading ||
        leaveBalanceQuery.isLoading ||
        holidaysQuery.isLoading;

    const error = employeeQuery.error || statsQuery.error;

    // Transform API data to match existing component expectation
    const employeeData = userId ? {
        personalInfo: {
            name: profile?.full_name,
            employeeId: profile?.employee_id,
            department: profile?.departments?.name || profile?.department_id,
            position: profile?.designation,
            email: profile?.email,
            phone: profile?.phone || 'Not provided',
            location: profile?.address || 'Remote',
            joinDate: profile?.join_date,
            manager: profile?.manager?.full_name || 'HR Department',
            workSchedule: '9:00 AM - 6:00 PM', // Could be from company settings
            employmentType: profile?.employment_type || 'Full-time'
        },
        attendance: {
            status: todayAttendanceQuery.data?.data?.check_in_time ?
                (todayAttendanceQuery.data?.data?.check_out_time ? 'checked-out' : 'checked-in') :
                'not-checked-in',
            checkInTime: todayAttendanceQuery.data?.data?.check_in_time,
            checkOutTime: todayAttendanceQuery.data?.data?.check_out_time,
            todayHours: todayAttendanceQuery.data?.data?.total_hours || '0',
            weeklyAverage: statsQuery.data?.data?.attendance?.weekly_average || '0',
            monthlyAttendance: statsQuery.data?.data?.attendance?.monthly_rate || '100%',
        },
        leave: {
            summary: {
                total: leaveBalanceQuery.data?.data?.casual_leave_total + leaveBalanceQuery.data?.data?.sick_leave_total,
                used: leaveBalanceQuery.data?.data?.casual_leave_used + leaveBalanceQuery.data?.data?.sick_leave_used,
                remaining: (leaveBalanceQuery.data?.data?.casual_leave_total + leaveBalanceQuery.data?.data?.sick_leave_total) -
                    (leaveBalanceQuery.data?.data?.casual_leave_used + leaveBalanceQuery.data?.data?.sick_leave_used),
                pending: statsQuery.data?.data?.leaves?.pending_requests || 0
            },
            breakdown: [
                { type: "Casual", total: leaveBalanceQuery.data?.data?.casual_leave_total, used: leaveBalanceQuery.data?.data?.casual_leave_used, remaining: leaveBalanceQuery.data?.data?.casual_leave_total - leaveBalanceQuery.data?.data?.casual_leave_used },
                { type: "Sick", total: leaveBalanceQuery.data?.data?.sick_leave_total, used: leaveBalanceQuery.data?.data?.sick_leave_used, remaining: leaveBalanceQuery.data?.data?.sick_leave_total - leaveBalanceQuery.data?.data?.sick_leave_used },
            ],
            upcoming: myLeavesQuery.data?.data?.leaves?.filter(l => new Date(l.start_date) > new Date()) || []
        },
        performance: {
            score: 4.5, // These could come from a performance API
            rating: "Excellent",
            lastReviewDate: "Oct 15, 2024",
            nextReviewDate: "Apr 15, 2025",
            metrics: [
                { name: "Productivity", score: 4.8 },
                { name: "Quality", score: 4.6 },
                { name: "Teamwork", score: 4.4 },
                { name: "Initiative", score: 4.7 }
            ],
            achievements: []
        },
        kpi: {
            current: 0,
            target: 0,
            trend: 0,
            status: "met",
            period: "Current Period",
            metrics: {}
        },
        kpiHistory: [],
        holidays: holidaysQuery.data?.data?.map(h => ({
            ...h,
            daysUntil: Math.ceil((new Date(h.date) - new Date()) / (1000 * 60 * 60 * 24))
        })).filter(h => h.daysUntil >= 0).slice(0, 3) || [],
        files: [], // Could come from a files API
        team: [], // Could come from a team API
    } : null;

    const checkInMutation = useCheckIn();
    const checkOutMutation = useCheckOut();

    const toggleAttendance = () => {
        const isCheckedIn = todayAttendanceQuery.data?.data?.check_in_time && !todayAttendanceQuery.data?.data?.check_out_time;

        if (isCheckedIn) {
            checkOutMutation.mutate();
        } else {
            checkInMutation.mutate();
        }
    };

    return {
        employeeData,
        isLoading,
        error: error?.message,
        refetch: () => {
            employeeQuery.refetch();
            statsQuery.refetch();
            todayAttendanceQuery.refetch();
            myLeavesQuery.refetch();
            leaveBalanceQuery.refetch();
        },
        toggleAttendance
    };
};
