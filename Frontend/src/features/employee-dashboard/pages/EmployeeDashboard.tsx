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
        } catch (err: any) {} finally {
            setIsSavingAttendance(false);
        }
    };

    const onCheckOut = async () => {
        setIsSavingAttendance(true);
        try {
            await checkOut.mutateAsync();
        } catch (err: any) {} finally {
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
            <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight font-sans">Growth Cycle, {userName}</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={() => setCurrentView('leaves')}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-slate-200 hover:border-emerald-200"
             >
                Request Maintenance
             </button>
             <button
                 className={cn(
                    "btn-primary py-3 px-8",
                    !canCheckIn && canCheckOut ? "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700" : ""
                 )}
                 onClick={canCheckIn ? onCheckIn : onCheckOut}
                 disabled={isSavingAttendance || (!canCheckIn && !canCheckOut)}
             >
                 {isSavingAttendance ? 'Syncing...' : canCheckIn ? 'Punch In' : canCheckOut ? 'Punch Out' : 'Cycle Completed'}
             </button>
          </div>
        </div>

        {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-pulse">
                <AlertCircle size={18} />
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Ecosystem Contribution" value="98.4%" trend="+1.2%" icon={<Clock />} theme="emerald" />
            <div className="card-premium p-6 border-none shadow-premium flex flex-col justify-center bg-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Maintenance Quota</p>
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[60%] rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">14/24 <span className="text-[10px] text-slate-300">Days</span></span>
                </div>
            </div>
            <StatCard title="Active Directives" value="08" icon={<CheckSquare />} theme="amber" />
            <StatCard title="Operational Minutes" value={String(todaysMinutes)} icon={<Award />} theme="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-premium p-0 border-none shadow-premium overflow-hidden bg-white">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-emerald-50/30 to-transparent">
                    <h3 className="text-lg font-bold font-sans">Priority Directives</h3>
                    <button 
                        onClick={() => setCurrentView('tasks')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
                    >
                        Full Hub
                    </button>
                </div>
                <div className="p-0">
                    <TaskItem title="Harvest Capacity Audit" category="Operations" due="Today" priority="high" />
                    <TaskItem title="Protocol Update Review" category="Compliance" due="Tomorrow" priority="medium" />
                    <TaskItem title="System Calibration Feedback" category="Maintenance" due="Mar 20" priority="low" />
                </div>
            </div>

            <div className="card-premium p-8 border-none shadow-premium h-fit bg-white text-left">
                <h4 className="text-sm font-bold mb-6 font-sans">Organizational Protocols</h4>
                <div className="space-y-4">
                    {policies.slice(0, 3).map((policy) => (
                      <div key={policy.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:border-emerald-200 transition-all group cursor-pointer text-left">
                        <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{policy.title}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2">{policy.policy_type}</p>
                      </div>
                    ))}
                    {policies.length === 0 && (
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No protocols found.</p>
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
    const isEmerald = theme === 'emerald';
    return (
        <div className="card-premium p-8 group border-none shadow-premium relative overflow-hidden bg-white text-left">
            <div className={cn(
                "absolute top-0 right-0 p-6 opacity-5 transition-all group-hover:scale-125 duration-500",
                isEmerald ? "text-emerald-900" : "text-amber-900"
            )}>
                {React.cloneElement(icon, { size: 80 })}
            </div>
            <div className="flex flex-col gap-6 relative z-10">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                    isEmerald ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                        {trend && <span className="text-[10px] font-bold text-emerald-600">{trend}</span>}
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-main)] tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
};

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 last:border-0 hover:bg-emerald-50/30 transition-all group cursor-pointer text-left">
        <div className="flex items-center gap-4 text-left">
            <div className={cn(
                "w-1.5 h-8 rounded-full shadow-sm",
                priority === 'high' ? 'bg-rose-500 shadow-rose-500/20' : priority === 'medium' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-200'
            )}></div>
            <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-800 transition-colors tracking-tight text-left">{title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{category}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{due}</span>
                </div>
            </div>
        </div>
        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
);

const PlaceholderBox = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 animate-in zoom-in-95 duration-500">
         <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner">
            <LayoutDashboard size={40} />
         </div>
         <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[var(--text-main)] font-sans">{title} Calibration</h2>
            <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">We are currently synchronizing this module with the central grid. Full operational status expected in the next cycle.</p>
         </div>
    </div>
);

export default EmployeeDashboard;
