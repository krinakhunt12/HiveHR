import React, { useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Clock,
    Calendar,
    CheckSquare,
    ArrowUpRight,
    MessageSquare,
    Award,
    AlertCircle,
    TrendingUp,
    LayoutDashboard,
    Wind,
    Target
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import LeaveSummary from '@/shared/components/LeaveSummary';
import { cn } from '@/shared/utils/cn';
import { useTodayAttendance, useListPolicies, useAttendanceMutations, useGetMe, type AttendanceLog } from '@/shared/api/hooks/hrHooks';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { TaskManagementView } from '@/features/tasks/pages/TaskManagementView';

type View = 'dashboard' | 'leaves' | 'tasks' | 'messages' | 'performance';

const EmployeeDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);
    const { data: user } = useGetMe();
    const userName = user?.full_name?.split(' ')[0] || 'User';

    const companyId = (import.meta.env.VITE_HR_COMPANY_ID as string | undefined)?.trim();
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
        } catch (err: any) { } finally {
            setIsSavingAttendance(false);
        }
    };

    const onCheckOut = async () => {
        if (!attendanceToday?.id) return;
        setIsSavingAttendance(true);
        try {
            await checkOut.mutateAsync(attendanceToday.id);
        } catch (err: any) { } finally {
            setIsSavingAttendance(false);
        }
    };

    const hasAttendance = attendanceToday && 'id' in attendanceToday;
    const canCheckIn = !hasAttendance;
    const canCheckOut = hasAttendance && !attendanceToday.check_out_at;
    const todaysMinutes = (hasAttendance ? attendanceToday.work_minutes : 0) ?? 0;

    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: 'dashboard' },
        { icon: <Target size={18} />, label: 'Directives', path: 'tasks' },
        { icon: <Wind size={18} />, label: 'Lifecycle', path: 'leaves' },
        { icon: <CheckSquare size={18} />, label: 'Tasks', path: 'tasks' },
        { icon: <MessageSquare size={18} />, label: 'Messages', path: 'messages' },
        { icon: <Award size={18} />, label: 'Excellence', path: 'performance' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderDashboard = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 tracking-tight font-sans">Growth Cycle, {userName}</h1>
                    <p className="text-sm font-medium text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setCurrentView('leaves')}
                        className="px-5 py-2 text-sm font-medium uppercase tracking-wider text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-slate-200 bg-white"
                    >
                        Request Leave
                    </button>
                    <button
                        className={cn(
                            "px-6 py-2 rounded-md font-medium text-sm uppercase tracking-wider transition-all active:scale-[0.98]",
                            canCheckIn
                                ? "bg-blue-600 text-white"
                                : canCheckOut
                                    ? "bg-amber-500 text-white"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                        onClick={canCheckIn ? onCheckIn : onCheckOut}
                        disabled={isSavingAttendance || (!canCheckIn && !canCheckOut)}
                    >
                        {isSavingAttendance ? 'Syncing...' : canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Completed'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-pulse">
                    <AlertCircle size={18} />
                    <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Ecosystem Contribution" value="98.4%" trend="+1.2%" icon={<Clock />} theme="indigo" />
                <div className="card-premium p-6 border-none flex flex-col justify-center bg-white shadow-sm">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Maintenance Quota</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[60%] rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700">14/24 <span className="text-sm text-slate-300">Days</span></span>
                    </div>
                </div>
                <StatCard title="Active Directives" value="08" icon={<CheckSquare />} theme="amber" />
                <StatCard title="Operational Minutes" value={String(todaysMinutes)} icon={<Award />} theme="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-premium p-0 overflow-hidden border border-slate-200 shadow-none">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-md font-medium text-slate-900 font-sans">Recent Tasks</h3>
                        <button
                            onClick={() => setCurrentView('tasks')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-0">
                        <TaskItem title="Harvest Capacity Audit" category="Operations" due="Today" priority="high" />
                        <TaskItem title="Protocol Update Review" category="Compliance" due="Tomorrow" priority="medium" />
                        <TaskItem title="System Calibration Feedback" category="Maintenance" due="Mar 20" priority="low" />
                    </div>
                </div>

                <div className="card-premium p-6 border border-slate-200 shadow-none h-fit text-left">
                    <h4 className="text-sm font-medium text-slate-400 mb-4 font-sans uppercase tracking-widest">Company Policies</h4>
                    <div className="space-y-2">
                        {policies.slice(0, 3).map((policy) => (
                            <div key={policy.id} className="p-3 rounded-md border border-slate-100 bg-white hover:border-blue-200 transition-all group cursor-pointer text-left">
                                <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{policy.title}</p>
                                <p className="text-sm uppercase tracking-wider text-slate-300 font-medium mt-1">{policy.policy_type}</p>
                            </div>
                        ))}
                        {policies.length === 0 && (
                            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No protocols found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <DashboardLayout navItems={customNavItems as any}>
                <div className="space-y-12">
                    <Skeleton className="h-12 w-64 rounded-2xl" />
                    <div className="grid grid-cols-4 gap-8">
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                    </div>
                    <Skeleton className="h-96 rounded-3xl" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'tasks' && <TaskManagementView isAdmin={false} />}
                {currentView === 'leaves' && <LeaveManagementView isAdmin={false} />}
                {currentView === 'messages' && <PlaceholderBox title="Comms Node" />}
                {currentView === 'performance' && <PlaceholderBox title="Excellence Metrics" />}
            </main>
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, icon, trend, theme }: any) => {
    const isBlue = theme === 'indigo' || theme === 'blue';
    return (
        <div className="card-premium p-6 group border border-slate-100 transition-all bg-white text-left">
            <div className="flex flex-col gap-4 relative z-10">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isBlue ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                )}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-medium text-slate-900 tracking-tight">{value}</p>
                        {trend && <span className="text-sm font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{trend}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all cursor-pointer text-left">
        <div className="flex items-center gap-4 text-left">
            <div className={cn(
                "w-1 h-6 rounded-full",
                priority === 'high' ? 'bg-rose-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-slate-200'
            )}></div>
            <div>
                <p className="text-base font-medium text-slate-700 hover:text-blue-700 transition-colors text-left">{title}</p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">{category}</span>
                    <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"></span>
                    <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">{due}</span>
                </div>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-all" />
    </div>
);

const PlaceholderBox = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100">
            <LayoutDashboard size={24} />
        </div>
        <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 font-sans">{title} Module</h2>
            <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">This section is being synchronized. Detailed metrics will be available in the next update cycle.</p>
        </div>
    </div>
);

export default EmployeeDashboard;
