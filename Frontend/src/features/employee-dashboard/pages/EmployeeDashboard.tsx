import React, { useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Clock,
    Award,
    AlertCircle,
    LayoutDashboard,
    Wind,
    FileText,
    Calendar,
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton, SkeletonCard, SkeletonPageHeader } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useTodayAttendance, useAttendanceMutations, useGetMe } from '@/shared/api/hooks/hrHooks';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { ForcePasswordChangeModal } from '@/features/auth/components/ForcePasswordChangeModal';
import { PoliciesView } from '@/features/policies/pages/PoliciesView';

type View = 'dashboard' | 'leaves' | 'policies';

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
    const canCheckOut = hasAttendance && !attendanceToday.check_out_time;

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
        const interval = setInterval(updateElapsed, 30000);

        return () => clearInterval(interval);
    }, [checkInTime, attendanceToday?.check_out_at]);

    const breakMinutes = attendanceToday?.break_minutes ?? 60;

    const displayMinutes = attendanceToday?.check_out_at
        ? (attendanceToday.net_work_minutes ?? attendanceToday.work_minutes ?? 0)
        : elapsedMinutes > 240
            ? Math.max(0, elapsedMinutes - breakMinutes)
            : elapsedMinutes;

    const totalStayMinutes = attendanceToday?.check_out_at
        ? (attendanceToday.check_in_at && attendanceToday.check_out_at
            ? Math.floor((new Date(attendanceToday.check_out_at).getTime() - new Date(attendanceToday.check_in_at).getTime()) / 60000)
            : attendanceToday.net_work_minutes ?? 0)
        : elapsedMinutes;

    const workProgress = Math.min(100, (Number(displayMinutes) / 480) * 100);
    const estimatedPunchOut = checkInTime ? new Date(checkInTime + (9 * 60 * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: 'dashboard' },
        { icon: <Wind size={18} />, label: 'Leaves', path: 'leaves' },
        { icon: <FileText size={18} />, label: 'Policies', path: 'policies' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderDashboard = () => (
        <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-textPrimary">Welcome, {userName}</h1>
                    <div className="flex items-center gap-2 text-sm font-medium text-textSecondary mt-2">
                        <Calendar size={14} className="text-primary" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {hasAttendance && !attendanceToday.check_out_at && (
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary mb-1.5">Target Punch Out (9h)</p>
                            <Badge variant="outline" className="text-lg font-bold text-primary px-3 py-1 border-primary/20 bg-primary/5 rounded-xl shadow-none">
                                {estimatedPunchOut}
                            </Badge>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setCurrentView('leaves')}
                            className="h-11 px-6 rounded-xl font-bold border-border bg-white shadow-sm hover:shadow-md transition-all"
                        >
                            Request Leave
                        </Button>
                        <Button
                            size="lg"
                            className={cn(
                                "h-11 px-8 rounded-xl font-bold shadow-lg transition-all",
                                canCheckIn ? "bg-primary" : canCheckOut ? "bg-slate-900" : "bg-muted text-textSecondary"
                            )}
                            onClick={canCheckIn ? onCheckIn : onCheckOut}
                            disabled={(!canCheckIn && !canCheckOut) || isSavingAttendance}
                        >
                            {isSavingAttendance ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>{canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Operational'}</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Card className="bg-error/5 border-error/20 p-4 rounded-2xl flex items-center gap-4 text-error animate-in zoom-in duration-300">
                    <AlertCircle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="rounded-3xl p-10 border-border/40 shadow-sm bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp size={100} />
                    </div>
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary" /> Shift Completion
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-bold text-textPrimary tracking-tighter">{Math.round(workProgress)}%</span>
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Requirement: 8h</span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/10">
                            <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(5,150,105,0.3)]" style={{ width: `${workProgress}%` }} />
                        </div>
                    </div>
                    {workProgress >= 100 && (
                        <div className="mt-8 flex items-center gap-2 text-success">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Operational Quota Reached</span>
                        </div>
                    )}
                </Card>

                <StatCard 
                    title="Total Stay" 
                    value={`${Math.floor(totalStayMinutes / 60)}h ${totalStayMinutes % 60}m`} 
                    icon={<Clock />} 
                    theme={totalStayMinutes >= 540 ? "success" : "primary"} 
                    trend="Sync Active"
                />
                
                <StatCard 
                    title="Work Minutes" 
                    value={String(displayMinutes)} 
                    icon={<Award />} 
                    theme="primary" 
                    trend="Verified"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="rounded-3xl bg-slate-900 p-10 text-white border-none overflow-hidden relative group shadow-2xl">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Wind size={160} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-10 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                            <div className="p-4 bg-white/10 w-fit rounded-2xl border border-white/10 shadow-inner">
                                <Wind size={28} className="text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold tracking-tight">Leave Registry</h4>
                                <p className="text-sm font-medium text-white/60 leading-relaxed">View your leave balance and track your request status in real-time within the enterprise cloud.</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setCurrentView('leaves')}
                            className="w-full h-12 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all border-none shadow-lg gap-2"
                        >
                            Check Balance <ArrowRight size={16} />
                        </Button>
                    </div>
                </Card>

                <Card className="rounded-3xl border-border/40 shadow-sm bg-white p-10 text-left overflow-hidden relative">
                    <CardHeader className="p-0 mb-8">
                        <CardTitle className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" /> Operational Feed
                        </CardTitle>
                    </CardHeader>
                    <div className="space-y-8">
                        <div className="flex gap-5 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform"></div>
                            <div>
                                <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">Attendance Synchronization</p>
                                <p className="text-xs font-medium text-textSecondary mt-2 leading-relaxed">Global attendance logs are being synchronized with the payroll cluster for the current cycle.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <div>
                                <p className="text-sm font-bold text-textPrimary group-hover:text-success transition-colors">System Stability</p>
                                <p className="text-xs font-medium text-textSecondary mt-2 leading-relaxed">Infrastructure reporting 100% uptime for all core modules during this operational shift.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mt-1.5 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">New Policy Update</p>
                                <p className="text-xs font-medium text-textSecondary mt-2 leading-relaxed">Please review the updated remote work guidelines in the Policies section.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <DashboardLayout navItems={customNavItems as any}>
                <div className="p-8 space-y-12">
                    <SkeletonPageHeader />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SkeletonCard className="h-44" />
                        <SkeletonCard className="h-44" />
                        <SkeletonCard className="h-44" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <Skeleton className="h-80 rounded-[3rem]" />
                        <Skeleton className="h-80 rounded-[3rem]" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in duration-500 min-h-[80vh]">
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'leaves' && <LeaveManagementView isAdmin={false} />}
                {currentView === 'policies' && <PoliciesView isAdmin={false} />}
            </main>

            <ForcePasswordChangeModal
                isOpen={!!(user?.role === 'employee' && user?.is_first_login)}
                onSuccess={() => refetchMe()}
            />
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, icon, trend, theme }: any) => {
    const isSuccess = theme === 'success';
    
    return (
        <Card className="rounded-3xl p-10 group relative overflow-hidden bg-white border-border/40 shadow-sm hover:shadow-lg transition-all duration-500 text-left">
            <div className="absolute -bottom-8 -right-8 p-6 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 text-primary">
                {React.cloneElement(icon, { size: 180 })}
            </div>
            <div className="flex flex-col gap-10 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-sm",
                        isSuccess ? "bg-success/5 text-success border-success/10 group-hover:bg-success group-hover:text-white" : "bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white"
                    )}>
                        {React.cloneElement(icon, { size: 28 })}
                    </div>
                    {trend && (
                        <Badge variant="outline" className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-surface border-border/40 shadow-none">
                            {trend}
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-3">{title}</p>
                    <p className="text-4xl font-bold text-textPrimary tracking-tighter leading-none">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export default EmployeeDashboard;
