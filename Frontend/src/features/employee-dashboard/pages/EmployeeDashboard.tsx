import React, { useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Clock,
    Award,
    AlertCircle,
    LayoutDashboard,
    Wind
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useTodayAttendance, useAttendanceMutations, useGetMe } from '@/shared/api/hooks/hrHooks';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { ForcePasswordChangeModal } from '@/features/auth/components/ForcePasswordChangeModal';

type View = 'dashboard' | 'leaves';

const EmployeeDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const { data: user, refetch: refetchMe } = useGetMe();
    const userName = user?.full_name?.split(' ')[0] || 'User';

    const { data: attendanceToday, isLoading: loadingAttendance, error: attendanceError } = useTodayAttendance();
    const { checkIn, checkOut } = useAttendanceMutations();

    const isLoading = loadingAttendance;
    const error = (attendanceError as any)?.message ?? null;

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
    
    const checkInTime = hasAttendance && attendanceToday.check_in_at ? new Date(attendanceToday.check_in_at).getTime() : null;
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    React.useEffect(() => {
        if (!checkInTime || attendanceToday?.check_out_at) {
            setElapsedMinutes(0);
            return;
        }
        
        const updateElapsed = () => {
            const now = new Date().getTime();
            setElapsedMinutes(Math.floor((now - checkInTime) / 60000));
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 30000); // Update every 30s
        
        return () => clearInterval(interval);
    }, [checkInTime, attendanceToday?.check_out_at]);

    // Break logic: Usually 60 mins. 
    // We only deduct it if the user has been here for more than 4 hours (240 mins) or if they've checked out.
    const breakMinutes = attendanceToday?.break_minutes ?? 60;
    
    const displayMinutes = attendanceToday?.check_out_at 
        ? (attendanceToday.work_minutes ?? 0)
        : elapsedMinutes > 240 
            ? Math.max(0, elapsedMinutes - breakMinutes) 
            : elapsedMinutes; 

    const totalStayMinutes = attendanceToday?.check_out_at
        ? (attendanceToday.check_in_at && attendanceToday.check_out_at 
            ? Math.floor((new Date(attendanceToday.check_out_at).getTime() - new Date(attendanceToday.check_in_at).getTime()) / 60000)
            : 0)
        : elapsedMinutes;

    const workProgress = Math.min(100, (Number(displayMinutes) / 480) * 100);
    const estimatedPunchOut = checkInTime ? new Date(checkInTime + (9 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: 'dashboard' },
        { icon: <Wind size={18} />, label: 'Leaves', path: 'leaves' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-premium p-8 bg-gradient-to-br from-primary to-primaryDark text-white flex flex-col justify-between shadow-xl shadow-primary/20 text-left border-none">
                    <div>
                        <div className="p-3 bg-white/10 w-fit rounded-xl mb-6">
                            <Wind size={24} />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight mb-2">Leave Registry</h4>
                        <p className="text-sm font-medium text-white/70 leading-relaxed">View your leave balance and track your request status in real-time within the enterprise cloud.</p>
                    </div>
                    <button 
                        onClick={() => setCurrentView('leaves')}
                        className="w-fit px-8 py-2.5 bg-white text-primary rounded-lg mt-8 font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-colors"
                    >
                        Check Balance
                    </button>
                </div>

                <div className="card-premium p-8 bg-surface border border-border text-left">
                    <h4 className="text-sm font-medium text-textSecondary mb-6 font-sans uppercase tracking-[0.2em] opacity-50">Operational Updates</h4>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-textPrimary">Attendance Synchronization</p>
                                <p className="text-xs text-textSecondary mt-1 leading-relaxed">Global attendance logs are being synchronized with the payroll cluster.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-textPrimary">System Stability</p>
                                <p className="text-xs text-textSecondary mt-1 leading-relaxed">Infrastructure reporting 100% uptime for the current operational cycle.</p>
                            </div>
                        </div>
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
                {currentView === 'leaves' && <LeaveManagementView isAdmin={false} />}
            </main>

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

export default EmployeeDashboard;
