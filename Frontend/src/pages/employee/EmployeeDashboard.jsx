import React from 'react';
import {
    Clock,
    Calendar,
    Zap,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    Coffee,
    Moon,
    Sun,
    Command
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useEmployeeStats, useClockIn, useClockOut } from '../../hooks/api/useEmployeeQueries';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const EmployeeDashboard = () => {
    const { user, profile } = useSupabaseAuth();
    const { data: employeeData, isLoading } = useEmployeeStats(user?.id);
    const clockInMutation = useClockIn();
    const clockOutMutation = useClockOut();
    const { showToast } = useToast();

    const handleClockAction = async () => {
        try {
            if (!employeeData?.attendanceToday) {
                await clockInMutation.mutateAsync(user.id);
                showToast('Clock-In protocol established.', 'success');
            } else if (!employeeData.attendanceToday.check_out_time) {
                await clockOutMutation.mutateAsync({
                    attendanceId: employeeData.attendanceToday.id,
                    userId: user.id
                });
                showToast('Clock-Out protocol finalized.', 'success');
            }
        } catch (err) {
            showToast('Biometric sync failure.', 'error');
        }
    };

    const stats_cards = [
        {
            label: 'Attendance_Rate',
            value: '98%',
            icon: CheckCircle2,
            meta: 'OPTIMAL'
        },
        {
            label: 'Leaves_Consumed',
            value: employeeData?.stats?.presentDays > 0 ? '2_Units' : '0_Units',
            icon: Calendar,
            meta: 'BALANCE:OK'
        },
        {
            label: 'Operational_Sync',
            value: 'Grid_Active',
            icon: Zap,
            meta: 'SECURE_TUNNEL'
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-fade-in text-foreground uppercase tracking-widest font-black">
                {/* Header / Identity Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-foreground/5 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-black animate-pulse rounded-full"></div>
                            <p className="text-[10px] font-black text-muted-foreground tracking-[0.4em]">WORKSPACE / NODE_EMP_01</p>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                            Greetings, {profile?.full_name?.split(' ')[0] || 'PERSONNEL'}.
                        </h1>
                        <p className="text-[11px] font-bold text-muted-foreground lowercase tracking-normal">Maintain institutional productivity and synchronize all active objectives.</p>
                    </div>

                    <Card className="flex items-center gap-6 bg-secondary/20 p-4 border-foreground/10 rounded-none shadow-none min-w-[320px]">
                        <div className={cn(
                            "w-12 h-12 flex items-center justify-center border transition-colors",
                            employeeData?.attendanceToday ? (employeeData.attendanceToday.check_out_time ? 'bg-secondary border-foreground/5' : 'bg-foreground text-background') : 'bg-background border-foreground text-foreground'
                        )}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[8px] font-black text-muted-foreground tracking-[0.2em] mb-1">SESSION_STATE</p>
                            <p className="text-sm font-bold tracking-tight">
                                {isLoading ? 'SYNCING...' : employeeData?.attendanceToday ? (employeeData.attendanceToday.check_out_time ? 'CYCLE_FINALIZED' : 'ACTIVE_STATION') : 'INACTIVE_NODE'}
                            </p>
                        </div>
                        <Button
                            onClick={handleClockAction}
                            disabled={isLoading || clockInMutation.isLoading || clockOutMutation.isLoading || (employeeData?.attendanceToday?.check_out_time)}
                            className={cn(
                                "h-14 px-8 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                employeeData?.attendanceToday ? (employeeData.attendanceToday.check_out_time ? 'bg-secondary text-muted-foreground opacity-50' : 'bg-foreground text-background hover:bg-neutral-800') : 'bg-foreground text-background hover:bg-neutral-800'
                            )}
                        >
                            {isLoading ? '...' : (employeeData?.attendanceToday ? (employeeData.attendanceToday.check_out_time ? 'FINALIZED' : 'CLOCK_OUT') : 'CLOCK_IN')}
                        </Button>
                    </Card>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats_cards.map((card, i) => (
                        <Card key={i} className="rounded-none border-foreground/10 bg-background shadow-none hover:border-foreground transition-all group p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-10 h-10 border border-foreground/10 bg-secondary/50 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <div className="text-[8px] font-black opacity-30 group-hover:opacity-100 transition-opacity uppercase">{card.meta}</div>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground mb-2 tracking-[0.2em]">{card.label}</p>
                            <p className="text-4xl font-black tracking-tighter">{isLoading ? <Skeleton className="h-10 w-24" /> : card.value}</p>
                        </Card>
                    ))}
                </div>

                {/* Main Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Analytics Section */}
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="rounded-none border-foreground/10 bg-background shadow-none p-10">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-xl font-black tracking-tighter flex items-center gap-4">
                                    <BarChart3 className="w-5 h-5" />
                                    Temporal_Productivity_Audit
                                </h2>
                                <span className="text-[9px] font-black bg-secondary border border-foreground/5 px-3 py-1.5 underline decoration-2 underline-offset-4">ACTIVE_WINDOW:JAN_14-20</span>
                            </div>

                            <div className="flex items-end justify-between h-56 gap-4 border-b border-foreground/5 pb-4">
                                {[65, 80, 45, 90, 70, 85, 30].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="relative w-full h-full flex flex-col justify-end">
                                            <div
                                                style={{ height: `${height}%` }}
                                                className={cn(
                                                    "w-full max-w-[32px] mx-auto rounded-none transition-all duration-500",
                                                    i === 6 ? 'bg-secondary/40' : 'bg-foreground group-hover:opacity-50'
                                                )}
                                            ></div>
                                        </div>
                                        <span className="text-[8px] font-black text-muted-foreground tracking-widest">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Terminal Navigation */}
                        <div className="bg-foreground rounded-none p-12 text-background relative overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-background/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                            <h2 className="text-xl font-black mb-10 tracking-tighter">TERMINAL_COMMAND_SHORTCUTS</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Apply_Leave', icon: Moon },
                                    { label: 'Payslip_Data', icon: Zap },
                                    { label: 'KPI_Review', icon: BarChart3 },
                                    { label: 'Directory', icon: Sun }
                                ].map((item, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center gap-4 p-8 border border-background/10 bg-background/5 hover:bg-background hover:text-foreground transition-all group">
                                        <div className="p-3 border border-current transition-transform group-hover:rotate-12">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Operational Feedback */}
                    <div className="space-y-12">
                        <Card className="rounded-none border-foreground shadow-[10px_10px_0px_0px_rgba(0,0,0,0.4)] bg-background p-8">
                            <h3 className="text-lg font-black tracking-tighter mb-8 flex items-center gap-3">
                                <Coffee className="w-5 h-5 opacity-40" />
                                OPERATIONAL_OBJECTIVES
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { text: 'Sync Station Biometrics', active: employeeData?.attendanceToday },
                                    { text: 'Verify Weekly KPI Ledger', active: false },
                                    { text: 'Update Personal Identifiers', active: false }
                                ].map((task, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-secondary/30 border border-foreground/5 transition-all">
                                        <div className={cn(
                                            "w-4 h-4 border border-foreground flex items-center justify-center",
                                            task.active && "bg-foreground"
                                        )}>
                                            {task.active && <div className="w-2 h-2 bg-background" />}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black tracking-tight",
                                            task.active ? "text-muted-foreground line-through opacity-40" : "text-foreground"
                                        )}>{task.text.toUpperCase().replace(' ', '_')}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-10 h-12 flex items-center justify-center gap-3 border border-foreground/10 text-[9px] font-black uppercase hover:bg-foreground hover:text-background transition-all">
                                ACCESS_FULL_LOG
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Card>

                        <div className="p-10 border-2 border-foreground/5 bg-secondary/10 rounded-none relative overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Enterprise_Bulletin</h3>
                            </div>
                            <p className="text-muted-foreground text-[11px] font-bold leading-relaxed mb-8 normal-case tracking-normal">Institutional remote work protocols updated for Q1 cycle. Administrative review required for all personnel tokens.</p>
                            <Button className="w-full h-12 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-none hover:neutral-800">
                                READ_PROTOCOL
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;
