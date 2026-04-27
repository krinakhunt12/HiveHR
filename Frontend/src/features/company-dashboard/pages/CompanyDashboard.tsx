import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Users,
    UserPlus,
    Search,
    Clock,
    LayoutDashboard,
    Trash2,
    Edit3,
    Eye,
    Wind,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    TrendingUp,
    MapPin
} from 'lucide-react';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton, SkeletonCard, SkeletonPageHeader } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useListEmployees, useEmployeeMutations, type Employee, useListAttendance } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { EmployeeViewModal } from '../components/EmployeeViewModal';
import { PoliciesView } from '@/features/policies/pages/PoliciesView';

type View = 'overview' | 'directory' | 'time' | 'leaves' | 'policies';

const CompanyDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('overview');
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    const { session } = useAuthStore();
    const { toast } = useToast();

    const {
        data: employees = [],
        isLoading: loadingEmployees,
        error: employeesError,
        refetch: refetchEmployees
    } = useListEmployees();

    const { remove: removeEmployee } = useEmployeeMutations();
    const { data: attendance = [] } = useListAttendance({
        date: new Date().toISOString().split('T')[0]
    });

    const attendanceRecords = useMemo(() => {
        return attendance.map(record => {
            const emp = employees.find(e => e.id === record.employee_id);
            return {
                ...record,
                employeeName: emp?.full_name || 'Unknown Employee',
                work_location: (emp as any)?.work_location || 'Office'
            };
        });
    }, [attendance, employees]);

    const filteredEmployees = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return employees;
        return employees.filter((emp: Employee) => (
            emp.full_name.toLowerCase().includes(normalized) ||
            ((emp as any).designation_name ?? emp.designation ?? '').toLowerCase().includes(normalized)
        ));
    }, [employees, query]);

    const activeEmployeesCount = employees.filter((item: Employee) => item.status === 'active').length;

    // --- ACTIONS ---
    const handleDeleteEmployee = async (id: string, name: string) => {
        try {
            await removeEmployee.mutateAsync(id);
            toast({ title: 'Member Offboarded', description: `${name} has been removed from the directory.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message || 'Failed to remove member', type: 'error' });
        }
    }

    // --- UI CONFIG ---
    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', path: 'overview' },
        { icon: <Users size={18} />, label: 'Directory', path: 'directory' },
        { icon: <Clock size={18} />, label: 'Attendance', path: 'time' },
        { icon: <Wind size={18} />, label: 'Leaves', path: 'leaves' },
        { icon: <FileText size={18} />, label: 'Policies', path: 'policies' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderOverview = () => {
        if (employeesError) {
            return (
                <div className="p-8">
                    <ErrorState
                        error={employeesError as Error}
                        onRetry={refetchEmployees}
                        title="Operational Intelligence Offline"
                        description="We encountered an issue while aggregating your enterprise data."
                    />
                </div>
            );
        }

        return (
            <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-textPrimary">Operational Intel</h1>
                        <p className="text-sm font-medium text-textSecondary mt-1.5">Strategic overview for {session?.user?.email?.split('@')[1] || 'Enterprise'}.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" size="lg" className="h-11 px-6 rounded-xl font-semibold gap-2 border-border hover:bg-surface transition-all">
                            <BarChart3 size={18} /> Analytics
                        </Button>
                        <Button size="lg" className="h-11 px-6 rounded-xl font-bold gap-2 shadow-lg hover:shadow-xl transition-all" onClick={() => setIsAddModalOpen(true)}>
                            <UserPlus size={18} /> Onboard Member
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatCard title="Active Personnel" value={String(activeEmployeesCount)} icon={<Users />} trend="+4.2%" positive={true} />
                    <StatCard
                        title="Today's Attendance"
                        value={`${employees.length > 0 ? ((attendance.length / employees.length) * 100).toFixed(1) : "0"}%`}
                        icon={<Clock />}
                        trend={`${attendance.length} members`}
                        positive={true}
                    />
                    <StatCard title="Leave Velocity" value="08" icon={<Wind />} trend="-12.5%" positive={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <Card className="lg:col-span-2 p-10 rounded-3xl border-border/40 shadow-sm bg-white overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-xl font-bold text-textPrimary flex items-center gap-2">
                                    <TrendingUp className="text-primary" size={20} /> Resource Velocity
                                </h3>
                                <p className="text-sm font-medium text-textSecondary mt-1.5">Personnel expansion metrics for the current fiscal year</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-textSecondary">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Projected
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-textSecondary">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/20" /> Actual
                                </div>
                            </div>
                        </div>
                        <div className="h-64 flex items-end gap-5 px-2">
                            {[40, 70, 45, 95, 65, 85, 60, 80, 55, 90, 75, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/5 rounded-t-2xl relative group/bar transition-all duration-500 hover:bg-primary/10">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-primary rounded-t-2xl transition-all duration-1000 group-hover/bar:brightness-110 shadow-[0_0_15px_rgba(5,150,105,0.2)]"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] font-bold text-white px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all transform scale-90 group-hover/bar:scale-100">
                                            {h}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-8 px-2 text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                        </div>
                    </Card>

                    <Card className="rounded-3xl bg-slate-900 p-10 text-white border-none flex flex-col justify-between relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Clock size={160} strokeWidth={0.5} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="p-4 bg-white/10 w-fit rounded-2xl border border-white/10 shadow-inner">
                                <Clock size={28} className="text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold tracking-tight">Automated Registry</h4>
                                <p className="text-sm font-medium text-white/60 leading-relaxed">System monitoring suggests high engagement across all clusters for the current operational cycle.</p>
                            </div>
                        </div>
                        <Button className="relative z-10 w-full h-12 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg mt-10">
                            Audit Attendance Logs
                        </Button>
                    </Card>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-textPrimary">Personnel Registry</h2>
                    <p className="text-sm font-medium text-textSecondary mt-1.5">Managing {employees.length} enterprise members.</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-5 py-1.5 rounded-2xl border border-border/60 shadow-sm w-full md:w-[450px] focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <Search size={20} className="text-textSecondary" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or designation..."
                        className="bg-transparent border-none outline-none text-sm font-bold w-full py-3 placeholder:text-textSecondary/40 text-textPrimary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="rounded-3xl overflow-hidden border-border/40 shadow-sm bg-white min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border/40">
                                <th className="px-8 py-6 text-xs font-bold text-textSecondary uppercase tracking-widest">Resource</th>
                                <th className="px-8 py-6 text-xs font-bold text-textSecondary uppercase tracking-widest">Designation</th>
                                <th className="px-8 py-6 text-xs font-bold text-textSecondary uppercase tracking-widest">Timeline</th>
                                <th className="px-8 py-6 text-xs font-bold text-textSecondary uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-xs font-bold text-textSecondary uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loadingEmployees ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-6"><div className="flex gap-4"><Skeleton className="h-12 w-12 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                                        <td className="px-8 py-6"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-10 w-28 rounded-xl" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-lg" /></td>
                                        <td className="px-8 py-6 text-right"><Skeleton className="ml-auto h-10 w-20 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <EmptyState
                                            title={query ? "No search results" : "Registry Empty"}
                                            description={query ? `No members match "${query}" in this organization.` : "Personnel records will appear here once onboarded."}
                                            icon={Users}
                                            className="border-none shadow-none p-0"
                                            action={!query && (
                                                <Button size="lg" onClick={() => setIsAddModalOpen(true)} className="h-11 px-8 rounded-xl font-bold gap-2">
                                                    <UserPlus size={18} /> Start Onboarding
                                                </Button>
                                            )}
                                        />
                                    </td>
                                </tr>
                            ) : filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="group hover:bg-surface/50 transition-all cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary text-base border border-primary/10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                                                {emp.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{emp.full_name}</p>
                                                <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1.5">{emp.employee_code || '---'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-textPrimary">{(emp as any).designation_name ?? emp.designation ?? '—'}</p>
                                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1.5">{emp.employment_type}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-textPrimary">{emp.date_of_joining || '---'}</p>
                                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1.5">Joined</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge 
                                            variant={emp.status === 'active' ? 'default' : 'secondary'}
                                            className={cn(
                                                "px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]",
                                                emp.status === 'active' ? "bg-success/10 text-success border-success/20" : "bg-muted text-textSecondary border-border"
                                            )}
                                        >
                                            {emp.status}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingEmployee(emp)}
                                                className="h-10 w-10 text-textSecondary hover:text-primary hover:bg-primary/5 rounded-xl shadow-none"
                                            >
                                                <Eye size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingEmployee(emp)}
                                                className="h-10 w-10 text-textSecondary hover:text-primary hover:bg-primary/5 rounded-xl shadow-none"
                                            >
                                                <Edit3 size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                                                className="h-10 w-10 text-textSecondary hover:text-error hover:bg-error/5 rounded-xl shadow-none"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderOperationsView = () => (
        <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-textPrimary">Attendance Logs</h2>
                    <p className="text-sm font-medium text-textSecondary mt-1.5">Synchronized attendance and compute metrics.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-border">Export XML</Button>
                    <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-border">Shift Planner</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <Card className="lg:col-span-2 rounded-3xl overflow-hidden border-border/40 shadow-sm bg-white">
                    <CardHeader className="py-6 px-8 border-b border-border/40 bg-surface/50 flex items-center justify-between">
                        <CardTitle className="text-xs font-bold text-textSecondary uppercase tracking-widest">Real-time Check-ins</CardTitle>
                        <div className="flex items-center gap-2 px-3 py-1 bg-success/5 text-success rounded-full border border-success/10 text-[10px] font-bold tracking-widest uppercase">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            Live Cluster
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 min-h-[400px]">
                        {attendanceRecords.length === 0 ? (
                            <div className="py-24 text-center">
                                <EmptyState title="No logs today" description="Attendance records will populate once members check in." icon={Clock} className="border-none shadow-none" />
                            </div>
                        ) : (
                            <div className="divide-y divide-border/20">
                                {attendanceRecords.slice(0, 8).map((record, i) => (
                                    <div key={i} className="flex items-center justify-between group p-6 hover:bg-surface/50 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-11 h-11 rounded-2xl bg-surface border border-border/40 flex items-center justify-center font-bold text-textSecondary text-xs shadow-inner">
                                                {record.employeeName?.split(' ').map(n => n?.[0]).join('') || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{record.employeeName}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <MapPin size={10} className="text-textSecondary" />
                                                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">{record.work_location || 'Office'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1.5">
                                            <p className="text-sm font-bold text-primary tracking-tight">{record.check_in_time ? record.check_in_time.slice(0, 5) : '--:--'}</p>
                                            <Badge className={cn(
                                                "text-[9px] font-bold uppercase tracking-widest border-none shadow-none",
                                                record.status === 'present' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                                            )}>{record.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-3xl p-10 bg-white border-border/40 shadow-sm flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700 text-primary">
                        <TrendingUp size={200} />
                    </div>
                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-10">Utilization Velocity</h4>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-primary/5" />
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={Math.PI * 2 * 72} strokeDashoffset={Math.PI * 2 * 72 * (1 - 0.92)} className="text-primary transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-4xl font-bold text-textPrimary tracking-tighter">92%</span>
                                <p className="text-[9px] font-bold text-textSecondary uppercase tracking-widest mt-1">Efficiency</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-10 text-[10px] font-bold text-textSecondary leading-relaxed text-center group-hover:text-textPrimary transition-colors">Your organization is performing <span className="text-success">above average</span> for this cycle.</p>
                </Card>

                <Card className="rounded-3xl bg-primary p-10 text-white border-none flex flex-col justify-between relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={140} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="p-4 bg-white/20 w-fit rounded-2xl border border-white/20 shadow-inner">
                            <Wind size={24} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">System Health</p>
                            <h4 className="text-2xl font-bold tracking-tight">Sync Integrity</h4>
                            <p className="text-sm font-medium text-white/80 leading-relaxed">Leave and attendance records are fully synchronized across core clusters.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    if (loadingEmployees) {
        return (
            <DashboardLayout navItems={customNavItems as any}>
                <div className="p-8 space-y-12">
                    <SkeletonPageHeader />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SkeletonCard className="h-40" />
                        <SkeletonCard className="h-40" />
                        <SkeletonCard className="h-40" />
                    </div>
                    <Skeleton className="h-[600px] rounded-[3rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in duration-500 min-h-[80vh]">
                {currentView === 'overview' && renderOverview()}
                {currentView === 'directory' && renderDirectory()}
                {currentView === 'leaves' && <LeaveManagementView isAdmin={true} />}
                {currentView === 'time' && renderOperationsView()}
                {currentView === 'policies' && <PoliciesView isAdmin={true} />}
            </main>
            <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EmployeeViewModal
                isOpen={!!viewingEmployee}
                onClose={() => setViewingEmployee(null)}
                employee={viewingEmployee}
            />
            <EditEmployeeModal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                employee={editingEmployee}
            />
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, icon, trend, positive }: any) => {
    return (
        <Card className="rounded-3xl p-10 group relative overflow-hidden bg-white border-border/40 shadow-sm hover:shadow-lg transition-all duration-500 text-left">
            <div className="absolute -bottom-8 -right-8 p-6 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 text-primary">
                {React.cloneElement(icon, { size: 180 })}
            </div>
            <div className="flex flex-col gap-10 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                        {React.cloneElement(icon, { size: 28 })}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm",
                            positive ? "text-success bg-success/5 border-success/20" : "text-error bg-error/5 border-error/20"
                        )}>
                            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {trend}
                        </div>
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

function ShieldAlert({ size = 24, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

export default CompanyDashboard;


