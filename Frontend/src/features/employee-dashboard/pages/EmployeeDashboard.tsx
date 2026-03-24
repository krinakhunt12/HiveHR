import React, { useState, useEffect } from 'react';
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
import { cn } from '@/shared/utils/cn';
import { hrApi, type AttendanceLog, type CompanyPolicy } from '@/shared/api/hrApi';

const EmployeeDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attendanceToday, setAttendanceToday] = useState<AttendanceLog | null>(null);
    const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);

    const companyId = (import.meta.env.VITE_HR_COMPANY_ID as string | undefined)?.trim();
    const employeeId = (import.meta.env.VITE_HR_EMPLOYEE_ID as string | undefined)?.trim();
    const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!companyId || !employeeId) {
                setError('Set VITE_HR_COMPANY_ID and VITE_HR_EMPLOYEE_ID in frontend env to use attendance actions.');
                setIsLoading(false);
                return;
            }

            try {
                const [attendanceRes, policyRes] = await Promise.all([
                    hrApi.listAttendance({ employee_id: employeeId, attendance_date: today }),
                    hrApi.listPolicies(companyId),
                ]);

                if (!isMounted) return;
                setAttendanceToday(attendanceRes.data[0] ?? null);
                setPolicies(policyRes.data);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load employee dashboard data.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
  }, []);

    const onCheckIn = async () => {
        if (!companyId || !employeeId) return;

        setIsSavingAttendance(true);
        setError(null);
        try {
            const res = await hrApi.checkIn({
                company_id: companyId,
                employee_id: employeeId,
            });
            setAttendanceToday(res.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check in.');
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const onCheckOut = async () => {
        if (!employeeId) return;

        setIsSavingAttendance(true);
        setError(null);
        try {
            const res = await hrApi.checkOut({
                employee_id: employeeId,
            });
            setAttendanceToday(res.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check out.');
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const canCheckIn = !attendanceToday?.check_in_at;
    const canCheckOut = !!attendanceToday?.check_in_at && !attendanceToday?.check_out_at;
    const todaysMinutes = attendanceToday?.work_minutes ?? 0;

  const navItems = [
    { icon: <Clock size={18} />, label: 'Dashboard', path: '/dashboard/employee' },
    { icon: <Calendar size={18} />, label: 'Time Off', path: '#' },
    { icon: <CheckSquare size={18} />, label: 'Tasks', path: '#' },
    { icon: <MessageSquare size={18} />, label: 'Messages', path: '#' },
    { icon: <Award size={18} />, label: 'Performance', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="Staff" userName="John Doe" userInitials="JD">
        <div className="space-y-8">
          <div className="flex justify-between items-center"><Skeleton className="h-9 w-48" /><Skeleton className="h-9 w-32" /></div>
          <div className="grid grid-cols-4 gap-6"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>
          <div className="grid grid-cols-3 gap-6"><Skeleton className="col-span-2 h-[400px] rounded-xl" /><Skeleton className="h-[400px] rounded-xl" /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="Sr. Product Designer" userName="Johnathan Doe" userInitials="JD">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-main)] tracking-tight">Welcome back, Johnathan</h1>
            <p className="text-sm font-medium text-slate-400 mt-0.5">Monday, 15 March 2026</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-medium text-xs h-9">Request Time Off</Button>
                         <Button
                             size="sm"
                             className="font-medium text-xs h-9"
                             onClick={canCheckIn ? onCheckIn : onCheckOut}
                             disabled={isSavingAttendance || (!canCheckIn && !canCheckOut)}
                         >
                             {isSavingAttendance ? 'Saving...' : canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Completed'}
                         </Button>
          </div>
        </div>

                {error && (
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="p-4 flex items-center gap-3 text-rose-700">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Attendance" value="98.4%" trend="+1.2%" icon={<Clock className="text-[var(--color-primary)]/80" />} />
            <StatCard title="Leave Balance" value="14 Days" icon={<Calendar className="text-[var(--color-success-green)]/80" />} />
                        <StatCard title="Active Tasks" value="08" icon={<CheckSquare className="text-[var(--color-warning-orange)]/80" />} />
                        <StatCard title="Today Minutes" value={String(todaysMinutes)} icon={<Award className="text-indigo-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-50">
                    <CardTitle className="text-base font-semibold">Priority Tasks</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs font-semibold text-[var(--color-primary)]">Manage all</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <TaskItem title="Q2 Product Roadmap Review" category="Product" due="Today" priority="high" />
                    <TaskItem title="Customer Feedback Analysis" category="Research" due="Tomorrow" priority="medium" />
                    <TaskItem title="Updated Design System Guidelines" category="Design" due="Mar 20" priority="low" />
                </CardContent>
            </Card>

            <Card className="h-fit">
                <CardHeader className="py-5 border-b border-slate-50">
                    <CardTitle className="text-base font-semibold">Policy Highlights</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {policies.slice(0, 3).map((policy) => (
                      <div key={policy.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/30 text-left">
                        <p className="text-xs font-semibold text-[var(--color-text-main)]">{policy.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{policy.policy_type}</p>
                      </div>
                    ))}
                    {policies.length === 0 && (
                      <p className="text-xs text-slate-400">No policies available.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, trend }: any) => (
    <Card className="hover:border-[var(--color-primary)]/10">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success-green)] bg-[var(--color-success-green)]/5 px-2 py-0.5 rounded-full">
                        <TrendingUp size={10} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-xl font-semibold text-[var(--color-text-main)] tracking-tight leading-none">{value}</p>
        </CardContent>
    </Card>
);

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors group cursor-pointer">
        <div className="flex items-center gap-4 text-left">
            <div className={cn(
                "w-1 h-6 rounded-full",
                priority === 'high' ? 'bg-rose-400' : priority === 'medium' ? 'bg-[var(--color-warning-orange)]/60' : 'bg-slate-200'
            )}></div>
            <div>
                <p className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{category}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 font-medium">{due}</span>
                </div>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-[var(--color-primary)] transition-all" />
    </div>
);

export default EmployeeDashboard;
