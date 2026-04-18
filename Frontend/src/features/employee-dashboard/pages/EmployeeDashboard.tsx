import React, { useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Clock,
    CheckSquare,
    ArrowUpRight,
    MessageSquare,
    Award,
    AlertCircle,
    LayoutDashboard,
    Wind,
    Target
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useTodayAttendance, useListPolicies, useAttendanceMutations, useGetMe } from '@/shared/api/hooks/hrHooks';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { TaskManagementView } from '@/features/tasks/pages/TaskManagementView';
import { ForcePasswordChangeModal } from '@/features/auth/components/ForcePasswordChangeModal';

type View = 'dashboard' | 'leaves' | 'tasks' | 'messages' | 'performance';

const EmployeeDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const { data: user, refetch: refetchMe } = useGetMe();
    const userName = user?.full_name?.split(' ')[0] || 'User';

    const companyId = (import.meta.env.VITE_HR_COMPANY_ID as string | undefined)?.trim();

    const { data: attendanceToday, isLoading: loadingAttendance, error: attendanceError } = useTodayAttendance();
    const { data: policies = [], isLoading: loadingPolicies, error: policiesError } = useListPolicies({ company_id: companyId });
    const { checkIn, checkOut } = useAttendanceMutations();


    const isLoading = loadingAttendance || loadingPolicies;
    const error = (attendanceError as any)?.message ?? (policiesError as any)?.message ?? null;

    const onCheckIn = async () => {
        try {
            await checkIn.mutateAsync();
        } catch (err: any) { }
    };

    const onCheckOut = async () => {
        if (!attendanceToday?.id) return;
        try {
            await checkOut.mutateAsync(attendanceToday.id);
        } catch (err: any) { }
    };

    const isSavingAttendance = checkIn.isPending || checkOut.isPending;


    const hasAttendance = attendanceToday && 'id' in attendanceToday;
    const canCheckIn = !hasAttendance;
    const canCheckOut = hasAttendance && !attendanceToday.check_out_at;
    
    // Logic: 8h work + 1h break = 9h total stay requirement
    const checkInTime = hasAttendance ? new Date(attendanceToday.check_in_at!).getTime() : null;
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    React.useEffect(() => {
        if (!checkInTime || attendanceToday?.check_out_at) return;
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            setElapsedMinutes(Math.floor((now - checkInTime) / (1000 * 60)));
        }, 60000); // Update every minute
        
        // Initial calculation
        setElapsedMinutes(Math.floor((new Date().getTime() - checkInTime) / (1000 * 60)));
        
        return () => clearInterval(interval);
    }, [checkInTime, attendanceToday?.check_out_at]);

    const displayMinutes = attendanceToday?.check_out_at 
        ? attendanceToday.work_minutes 
        : (elapsedMinutes > 60 ? elapsedMinutes - 60 : 0); // Assume 1h break for real-time display

    const totalStayMinutes = attendanceToday?.check_out_at
        ? Math.floor((new Date(attendanceToday.check_out_at).getTime() - checkInTime!) / 60000)
        : elapsedMinutes;

    const workProgress = Math.min(100, (Number(displayMinutes) / 480) * 100);
    const estimatedPunchOut = checkInTime ? new Date(checkInTime + (9 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: 'dashboard' },
        { icon: <Target size={18} />, label: 'Tasks', path: 'tasks' },
        { icon: <Wind size={18} />, label: 'Leaves', path: 'leaves' },
        { icon: <MessageSquare size={18} />, label: 'Messages', path: 'messages' },
        { icon: <Award size={18} />, label: 'Performance', path: 'performance' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderDashboard = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 tracking-tight font-sans">Welcome, {userName}</h1>
                    <p className="text-sm font-medium text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {hasAttendance && !attendanceToday.check_out_at && (
                        <div className="text-right mr-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Target Punch Out (9h)</p>
                            <p className="text-lg font-medium text-primary tracking-tight">{estimatedPunchOut}</p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentView('leaves')}
                            className="px-5 py-2 text-sm font-medium uppercase tracking-wider text-textSecondary hover:text-primary hover:bg-primary/10 rounded-md transition-all border border-border bg-surface"
                        >
                            Request Leave
                        </button>
                        <button
                            className={cn(
                                "px-6 py-2 rounded-md font-medium text-sm uppercase tracking-wider transition-all active:scale-[0.98]",
                                canCheckIn
                                    ? "bg-primary text-white"
                                    : canCheckOut
                                        ? "bg-warning text-white"
                                        : "bg-background text-textSecondary cursor-not-allowed"
                            )}
                            onClick={canCheckIn ? onCheckIn : onCheckOut}
                            disabled={isSavingAttendance || (!canCheckIn && !canCheckOut)}
                        >
                            {isSavingAttendance ? 'Saving...' : canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Done'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-md flex items-center gap-3 text-error animate-pulse">
                    <AlertCircle size={18} />
                    <p className="text-sm font-medium uppercase tracking-widest">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="card-premium p-6 border border-border flex flex-col justify-center bg-surface shadow-none overflow-hidden relative">
                    <p className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-4">Work Progress (8h)</p>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${workProgress}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-textPrimary">{Math.round(workProgress)}%</span>
                    </div>
                    {workProgress >= 100 && <div className="absolute top-2 right-2 text-[10px] text-success font-bold uppercase tracking-tighter">Requirement Met</div>}
                </div>
                <StatCard title="Total Stay" value={`${Math.floor(totalStayMinutes / 60)}h ${totalStayMinutes % 60}m`} icon={<Clock />} theme={totalStayMinutes >= 540 ? "primary" : "warning"} />
                <StatCard title="Work Minutes" value={String(displayMinutes)} icon={<Award />} theme="primary" />
                <StatCard title="Active Tasks" value="08" icon={<CheckSquare />} theme="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-premium p-0 overflow-hidden border border-border shadow-none">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/50">
                        <h3 className="text-md font-medium text-textPrimary font-sans">Recent Tasks</h3>
                        <button
                            onClick={() => setCurrentView('tasks')}
                            className="text-sm font-medium text-primary hover:text-primaryLight uppercase tracking-wider"
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

                <div className="card-premium p-6 border border-border shadow-none h-fit text-left">
                    <h4 className="text-sm font-medium text-textSecondary mb-4 font-sans uppercase tracking-widest">Company Policies</h4>
                    <div className="space-y-2">
                        {policies.slice(0, 3).map((policy) => (
                            <div key={policy.id} className="p-3 rounded-md border border-border bg-surface hover:border-primary/30 transition-all group cursor-pointer text-left">
                                <p className="text-sm font-medium text-textPrimary group-hover:text-primary transition-colors">{policy.title}</p>
                                <p className="text-sm uppercase tracking-wider text-textSecondary font-medium mt-1">{policy.type}</p>
                            </div>
                        ))}
                        {policies.length === 0 && (
                            <p className="text-sm font-medium text-textSecondary uppercase tracking-widest text-center py-4">No policies found.</p>
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
                {currentView === 'messages' && <PlaceholderBox title="Messages" />}
                {currentView === 'performance' && <PlaceholderBox title="Performance" />}
            </main>

            {/* Mandatory First Login Flow */}
            <ForcePasswordChangeModal 
                isOpen={!!(user?.role === 'employee' && user?.is_first_login)} 
                onSuccess={() => refetchMe()}
            />
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, icon, trend, theme }: any) => {
    const isPrimary = theme === 'primary';
    const isWarning = theme === 'warning';

    return (
        <div className="card-premium p-6 group border border-border transition-all bg-surface text-left">
            <div className="flex flex-col gap-4 relative z-10">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isPrimary ? "bg-primary/10 text-primary" : isWarning ? "bg-warning/10 text-warning" : "bg-background text-textSecondary"
                )}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <div>
                    <p className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-1">{title}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-medium text-textPrimary tracking-tight">{value}</p>
                        {trend && <span className="text-sm font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-md">{trend}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-background transition-all cursor-pointer text-left">
        <div className="flex items-center gap-4 text-left">
            <div className={cn(
                "w-1 h-6 rounded-full",
                priority === 'high' ? 'bg-error' : priority === 'medium' ? 'bg-warning' : 'bg-border'
            )}></div>
            <div>
                <p className="text-base font-medium text-textPrimary hover:text-primary transition-colors text-left">{title}</p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-textSecondary font-medium uppercase tracking-wider">{category}</span>
                    <span className="w-1 h-1 bg-border rounded-full"></span>
                    <span className="text-sm text-textSecondary font-medium uppercase tracking-wider">{due}</span>
                </div>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-textSecondary group-hover:text-primary transition-all" />
    </div>
);

const PlaceholderBox = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <LayoutDashboard size={24} />
        </div>
        <div className="space-y-2">
            <h2 className="text-lg font-medium text-textPrimary font-sans">{title}</h2>
            <p className="text-sm font-medium text-textSecondary max-w-xs mx-auto leading-relaxed">This section will be ready soon.</p>
        </div>
    </div>
);

export default EmployeeDashboard;
