import React, { useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  ArrowUpRight, 
  MessageSquare,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import LeaveSummary from '@/shared/components/LeaveSummary';
import { cn } from '@/shared/utils/cn';
import { useTodayAttendance, useListPolicies, useAttendanceMutations, useGetMe, type AttendanceLog } from '@/shared/api/hooks/hrHooks';

const EmployeeDashboard = () => {
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);
    const { data: user } = useGetMe();
    const userName = user?.full_name?.split(' ')[0] || 'User';

    const companyId = (import.meta.env.VITE_HR_COMPANY_ID as string | undefined)?.trim();
    const employeeId = (import.meta.env.VITE_HR_EMPLOYEE_ID as string | undefined)?.trim();
    const today = new Date().toISOString().slice(0, 10);

    const { data: attendanceToday, isLoading: loadingAttendance, error: attendanceError } = useTodayAttendance();
    const { data: policiesResponse, isLoading: loadingPolicies, error: policiesError } = useListPolicies({ company_id: companyId });
    const { checkIn, checkOut } = useAttendanceMutations();

    const policies = policiesResponse?.data || [];

    const isLoading = loadingAttendance || loadingPolicies;
    const error = (attendanceError as any)?.message ?? (policiesError as any)?.message ?? null;

    const onCheckIn = async () => {
        setIsSavingAttendance(true);
        try {
            await checkIn.mutateAsync();
        } catch (err) {
            // Error handled via toast or dashboard error state
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const onCheckOut = async () => {
        setIsSavingAttendance(true);
        try {
            await checkOut.mutateAsync();
        } catch (err) {
            // silent
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const hasAttendance = attendanceToday && 'id' in attendanceToday;
    const canCheckIn = !hasAttendance;
    const canCheckOut = hasAttendance && !attendanceToday.check_out_at;
    const todaysMinutes = (hasAttendance ? attendanceToday.work_minutes : 0) ?? 0;

  const navItems = [
    { icon: <Clock size={18} />, label: 'Dashboard', path: '/dashboard/employee' },
    { icon: <Calendar size={18} />, label: 'Time Off', path: '#' },
    { icon: <CheckSquare size={18} />, label: 'Tasks', path: '#' },
    { icon: <MessageSquare size={18} />, label: 'Messages', path: '#' },
    { icon: <Award size={18} />, label: 'Performance', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="space-y-10">
            <div className="flex justify-between items-center text-left">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-6">
                <Skeleton className="col-span-2 h-[450px] rounded-xl" />
                <Skeleton className="h-[450px] rounded-xl" />
            </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div>
            <h1 className="text-2xl font-semibold text-main tracking-tight">Welcome back, {userName}</h1>
            <p className="text-sm font-medium text-muted mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-medium text-xs h-9 border-border">Request Time Off</Button>
             <Button
                 variant="default"
                 size="sm"
                 className="font-medium text-xs h-9 shadow-sm shadow-indigo-500/10"
                 onClick={canCheckIn ? onCheckIn : onCheckOut}
                 disabled={isSavingAttendance || (!canCheckIn && !canCheckOut)}
             >
                 {isSavingAttendance ? 'Saving...' : canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Completed'}
             </Button>
          </div>
        </div>

                {error && (
                    <Card className="border-error/20 bg-error-bg">
                        <CardContent className="p-4 flex items-center gap-3 text-error">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Attendance" value="98.4%" trend="+1.2%" icon={<Clock className="text-primary/80" />} />
            <LeaveSummary paid={14} sick={6} />
            <StatCard title="Active Tasks" value="08" icon={<CheckSquare className="text-warning/80" />} />
            <StatCard title="Today Minutes" value={String(todaysMinutes)} icon={<Award className="text-indigo-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-soft">
                <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-soft text-left">
                    <CardTitle className="text-base font-semibold text-main">Priority Tasks</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">Manage all</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <TaskItem title="Q2 Product Roadmap Review" category="Product" due="Today" priority="high" />
                    <TaskItem title="Customer Feedback Analysis" category="Research" due="Tomorrow" priority="medium" />
                    <TaskItem title="Updated Design System Guidelines" category="Design" due="Mar 20" priority="low" />
                </CardContent>
            </Card>

            <Card className="h-fit border-soft text-left">
                <CardHeader className="py-5 border-b border-soft">
                    <CardTitle className="text-base font-semibold text-main">Policy Highlights</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {policies.slice(0, 3).map((policy) => (
                      <div key={policy.id} className="p-3 rounded-lg border border-soft bg-bg/30 text-left">
                        <p className="text-xs font-semibold text-main">{policy.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted mt-1">{policy.policy_type}</p>
                      </div>
                    ))}
                    {policies.length === 0 && (
                      <p className="text-xs text-muted">No policies available.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, trend }: any) => (
    <Card className="hover:border-primary/10 transition-all border-soft text-left">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
                <div className="p-2 bg-bg rounded-lg">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success-bg px-2 py-0.5 rounded-full">
                        <TrendingUp size={10} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <p className="text-xs font-medium text-muted mb-1">{title}</p>
            <p className="text-xl font-semibold text-main tracking-tight leading-none">{value}</p>
        </CardContent>
    </Card>
);

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between px-6 py-5 border-b border-soft last:border-0 hover:bg-bg transition-colors group cursor-pointer text-left">
        <div className="flex items-center gap-4 text-left">
            <div className={cn(
                "w-1 h-6 rounded-full",
                priority === 'high' ? 'bg-error/60' : priority === 'medium' ? 'bg-warning/60' : 'bg-border'
            )}></div>
            <div>
                <p className="text-sm font-medium text-main group-hover:text-primary transition-colors tracking-tight">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider">{category}</span>
                    <span className="w-1 h-1 bg-border rounded-full"></span>
                    <span className="text-[10px] text-muted font-medium">{due}</span>
                </div>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-dim group-hover:text-primary transition-all" />
    </div>
);

export default EmployeeDashboard;
