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
    Wind,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    FileText
} from 'lucide-react';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useListEmployees, useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { PoliciesView } from '@/features/policies/pages/PoliciesView';

type View = 'overview' | 'directory' | 'time' | 'leaves' | 'policies';

const CompanyDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('overview');
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const { session } = useAuthStore();
    const { toast } = useToast();

    const { 
        data: employees = [], 
        isLoading: loadingEmployees, 
        error: employeesError,
        refetch: refetchEmployees 
    } = useListEmployees();

    const { remove: removeEmployee } = useEmployeeMutations();

    const isLoading = loadingEmployees;
    const globalError = employeesError;

    const filteredEmployees = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return employees;
        return employees.filter((emp: Employee) => (
            emp.full_name.toLowerCase().includes(normalized) ||
            ((emp as any).designation_name ?? emp.designation ?? '').toLowerCase().includes(normalized)
        ));
    }, [employees, query]);

    const activeEmployees = employees.filter((item: Employee) => item.status === 'active').length;

    // --- ACTIONS ---
    const handleDeleteEmployee = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) return;
        try {
            await removeEmployee.mutateAsync(id);
            toast({ title: 'Member Offboarded', description: `${name} has been removed from the directory.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message || 'Failed to remove member', type: 'error' });
        }
    }

    // --- UI CONFIG ---
    const navItems = [
        { icon: <LayoutDashboard />, label: 'Overview', path: 'overview' },
        { icon: <Users />, label: 'Directory', path: 'directory' },
        { icon: <Clock />, label: 'Attendance', path: 'time' },
        { icon: <Wind />, label: 'Leaves', path: 'leaves' },
        { icon: <FileText />, label: 'Policies', path: 'policies' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderOverview = () => {
        if (globalError) {
            return (
                <div className="min-h-[600px] flex items-center justify-center">
                    <ErrorState 
                        error={globalError as Error} 
                        onRetry={() => {
                            refetchEmployees();
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-textPrimary tracking-tight font-display">Operational Intel</h1>
                        <p className="text-sm font-semibold text-textSecondary mt-1.5 opacity-60">Strategic overview for {session?.user?.email?.split('@')[1] || 'Enterprise'}.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="px-6 h-11 text-xs font-bold uppercase tracking-[0.1em] border-primary/10 hover:bg-primary/5">
                            <BarChart3 size={16} className="mr-2" /> Analytics
                        </Button>
                        <Button onClick={() => setIsAddModalOpen(true)} className="px-6 h-11 text-xs font-bold uppercase tracking-[0.1em] shadow-xl shadow-primary/20">
                            <UserPlus size={16} className="mr-2" /> Onboard Member
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Active Employees" value={String(activeEmployees)} icon={<Users />} trend="+4%" positive={true} />
                    <StatCard title="Attendance Rate" value="94.2%" icon={<Clock />} trend="+1.2%" positive={true} />
                    <StatCard title="Leave Utilization" value="08" icon={<Wind />} trend="-2" positive={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 card-premium p-8 bg-white text-left">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-lg font-bold font-display text-textPrimary">Resource Velocity</h3>
                                <p className="text-xs font-bold text-textSecondary opacity-50 uppercase tracking-widest mt-1">Personnel expansion metrics</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Projected</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/20" /> Actual</div>
                            </div>
                        </div>
                        <div className="h-56 flex items-end gap-4 px-2">
                            {[40, 70, 45, 95, 65, 85, 60, 80, 55, 90, 75, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/5 rounded-t-xl relative group transition-all duration-500 hover:bg-primary/10">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primaryLight rounded-t-xl transition-all duration-1000 group-hover:brightness-110"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-textPrimary text-[10px] font-bold text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6 px-1 text-[10px] font-black text-textSecondary/40 uppercase tracking-[0.2em]">
                            <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                        </div>
                    </div>

                    <div className="card-premium p-8 bg-gradient-to-br from-primary to-primaryDark text-white flex flex-col justify-between shadow-xl shadow-primary/20 text-left border-none">
                        <div>
                            <div className="p-3 bg-white/10 w-fit rounded-xl mb-6">
                                <Clock size={24} />
                            </div>
                            <h4 className="text-xl font-bold tracking-tight mb-2">Automated Registry</h4>
                            <p className="text-sm font-medium text-white/70 leading-relaxed">System monitoring suggests high engagement across all field regions for the current cycle.</p>
                        </div>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 mt-8 font-bold text-xs uppercase tracking-widest">
                            Audit Attendance Logs
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-textPrimary font-display">Personnel Registry</h2>
                    <p className="text-sm font-semibold text-textSecondary mt-1 opacity-60">Managing {employees.length} enterprise members.</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-5 py-1.5 rounded-2xl border border-primary/5 shadow-sm w-full md:w-[400px] focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <Search size={18} className="text-textSecondary/40" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or role..."
                        className="bg-transparent border-none outline-none text-sm font-bold w-full py-2.5 placeholder:text-textSecondary/30 text-textPrimary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-premium p-0 border border-primary/5 shadow-xl shadow-primary/[0.02] overflow-hidden bg-white min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/[0.02] border-b border-primary/5">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Member Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Designation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Timeline</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-6"><Skeleton className="h-10 w-48 rounded-xl" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-10 w-28 rounded-xl" /></td>
                                        <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-lg" /></td>
                                        <td className="px-8 py-6 text-right"><Skeleton className="ml-auto h-10 w-20 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <EmptyState 
                                            title={query ? "No search results" : "Registry Empty"} 
                                            description={query ? `No members match "${query}" in this organization.` : "Personnel records will appear here once onboarded."}
                                            icon={Users}
                                            className="p-12"
                                            action={!query && (
                                                <Button onClick={() => setIsAddModalOpen(true)} className="px-6 h-11 text-xs font-bold uppercase tracking-[0.1em]">
                                                    <UserPlus size={16} className="mr-2" /> Start Onboarding
                                                </Button>
                                            )}
                                        />
                                    </td>
                                </tr>
                            ) : filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="group hover:bg-primary/[0.01] transition-all cursor-pointer">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10 group-hover:scale-110 transition-all shadow-sm">
                                                {emp.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{emp.full_name}</p>
                                                <p className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1.5 opacity-50">{emp.employee_code || '---'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-textPrimary leading-none">{(emp as any).designation_name ?? emp.designation ?? '—'}</p>
                                        <p className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1.5 opacity-50">{emp.employment_type}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-textPrimary">{emp.joined_on || '---'}</p>
                                        <p className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1.5 opacity-50">Onboarded</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
                                            emp.status === 'active' ? 'bg-success/5 text-success border-success/10' : 'bg-background text-textSecondary border-primary/5'
                                        )}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingEmployee(emp)}
                                                className="h-10 w-10 text-textSecondary hover:text-primary hover:bg-primary/5 rounded-xl"
                                            >
                                                <Edit3 size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                                                className="h-10 w-10 text-textSecondary hover:text-error hover:bg-error/5 rounded-xl"
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
            </div>
        </div>
    );

    const renderOperationsView = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-textPrimary font-display">Time & Operations</h2>
                    <p className="text-sm font-semibold text-textSecondary mt-1 opacity-60">Synchronized attendance and compute metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="px-6 h-11 text-xs font-bold uppercase tracking-[0.1em]">Export Logs</Button>
                    <Button variant="outline" className="px-6 h-11 text-xs font-bold uppercase tracking-[0.1em]">Shift Schedule</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="card-premium p-6 bg-white col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-textSecondary opacity-50">Real-time Attendance</h4>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/5 text-success rounded-lg border border-success/10 text-[10px] font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            Live Sync
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { name: 'Sarah Wilson', status: 'Checked In', time: '08:42 AM', type: 'Office' },
                            { name: 'Marcus Chen', status: 'Remote', time: '09:05 AM', type: 'Sync' },
                            { name: 'Elena Rodriguez', status: 'Checked In', time: '08:15 AM', type: 'Field' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-primary/[0.02] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-textSecondary border border-primary/5 text-xs">
                                        {log.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-textPrimary">{log.name}</p>
                                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest opacity-40 mt-1">{log.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary">{log.time}</p>
                                    <p className="text-[10px] font-black text-success uppercase tracking-widest mt-1">{log.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="card-premium p-6 bg-white flex flex-col justify-between">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-textSecondary opacity-50 mb-6">Average Utilization</h4>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/5" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={Math.PI * 2 * 58} strokeDashoffset={Math.PI * 2 * 58 * (1 - 0.88)} className="text-primary transition-all duration-1000" />
                            </svg>
                            <span className="absolute text-2xl font-bold text-textPrimary">88%</span>
                        </div>
                        <p className="mt-6 text-xs font-bold text-textSecondary opacity-40 uppercase tracking-[0.2em]">Efficiency Index</p>
                    </div>
                </Card>

                <Card className="card-premium bg-primary text-white flex flex-col justify-between shadow-xl shadow-primary/30 border-none">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-white/10 rounded-xl text-white">
                            <Wind size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Registry Health</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Cycle Status</p>
                        <h4 className="text-2xl font-bold tracking-tight">Q3 Pulse Safe</h4>
                        <p className="text-xs font-medium text-white/70 mt-3 leading-relaxed">Leave and attendance records are fully synchronized across core clusters.</p>
                    </div>
                </Card>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <DashboardLayout navItems={customNavItems as any}>
                <div className="space-y-12">
                    <Skeleton className="h-14 w-80 rounded-2xl" />
                    <div className="grid grid-cols-4 gap-8">
                        <Skeleton className="h-36 rounded-3xl" />
                        <Skeleton className="h-36 rounded-3xl" />
                        <Skeleton className="h-36 rounded-3xl" />
                        <Skeleton className="h-36 rounded-3xl" />
                    </div>
                    <Skeleton className="h-[500px] rounded-[3rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in duration-500">
                {currentView === 'overview' && renderOverview()}
                {currentView === 'directory' && renderDirectory()}
                {currentView === 'leaves' && <LeaveManagementView isAdmin={true} />}
                {currentView === 'time' && renderOperationsView()}
                {currentView === 'policies' && <PoliciesView isAdmin={true} />}
            </main>
            <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
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
        <div className="card-premium p-8 group relative overflow-hidden bg-white text-left">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 text-primary">
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <div className="flex flex-col gap-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                        {React.cloneElement(icon, { size: 22 })}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                            positive ? "text-success bg-success/5 border-success/10" : "text-error bg-error/5 border-error/10"
                        )}>
                            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 opacity-50">{title}</p>
                    <p className="text-3xl font-bold text-textPrimary font-display tracking-tight leading-none">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;


