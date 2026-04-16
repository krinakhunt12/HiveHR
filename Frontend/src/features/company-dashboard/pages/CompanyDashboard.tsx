import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Users,
    UserPlus,
    Search,
    Briefcase,
    Clock,
    Calendar,
    FileText,
    LayoutDashboard,
    Trash2,
    Edit3,
    ArrowLeft,
    Wind,
    Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useListEmployees, useListPolicies, useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { LeaveManagementView } from '@/features/leave-management/pages/LeaveManagementView';
import { TaskManagementView } from '@/features/tasks/pages/TaskManagementView';

type View = 'overview' | 'directory' | 'jobs' | 'time' | 'policies' | 'leaves' | 'tasks';

const CompanyDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('overview');
    const [query, setQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const { session } = useAuthStore();
    const { toast } = useToast();
    const companyId = session?.user?.company_id ?? undefined;

    const { data: employeesResponse, isLoading: loadingEmployees, error: employeesError } = useListEmployees({ company_id: companyId });
    const { data: policiesResponse, isLoading: loadingPolicies, error: policiesError } = useListPolicies({ company_id: companyId });
    const { remove: removeEmployee } = useEmployeeMutations();

    const employees = employeesResponse?.data || [];
    const policies = policiesResponse?.data || [];

    const isLoading = loadingEmployees || loadingPolicies;
    const error = (employeesError as any)?.message ?? (policiesError as any)?.message ?? null;

    const filteredEmployees = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return employees;
        return employees.filter((emp: Employee) => (
            emp.full_name.toLowerCase().includes(normalized) ||
            emp.designation.toLowerCase().includes(normalized)
        ));
    }, [employees, query]);

    const activeEmployees = employees.filter((item: Employee) => item.status === 'active').length;

    // --- ACTIONS ---
    const handleDeleteEmployee = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from the ecosystem? This action is irreversible.`)) return;
        try {
            await removeEmployee.mutateAsync(id);
            toast({ title: 'Stakeholder Removed', description: `${name} has been detached from the organization.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Removal Failed', description: err.message || 'Failed to remove member', type: 'error' });
        }
    }

    // --- SHARED COMPONENTS ---
    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', path: 'overview' },
        { icon: <Users size={18} />, label: 'Directory', path: 'directory' },
        { icon: <Target size={18} />, label: 'Directives', path: 'tasks' },
        { icon: <Wind size={18} />, label: 'Lifecycle', path: 'leaves' },
        { icon: <Briefcase size={18} />, label: 'Vacancies', path: 'jobs' },
        { icon: <Clock size={18} />, label: 'Work-Logs', path: 'time' },
        { icon: <FileText size={18} />, label: 'Protocols', path: 'policies' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentView(item.path as View)
    }));

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                <div className="text-left">
                    <h1 className="text-xl font-medium text-textPrimary tracking-tight font-sans">Ecosystem Overview</h1>
                    <p className="text-sm font-medium text-textSecondary mt-0.5">Real-time vitals for your agricultural organization.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-textSecondary hover:text-primary hover:bg-primary/10 rounded-md transition-all border border-border hover:border-primary/30">Generate Report</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                        <UserPlus size={16} />
                        Add Stakeholder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ManagerStat title="Active Stakeholders" value={String(activeEmployees)} icon={<Users />} theme="primary" />
                <ManagerStat title="Workload Index" value="92%" icon={<Clock />} theme="warning" />
                <ManagerStat title="Upcoming Cycles" value="12" icon={<Calendar />} theme="primary" />
                <ManagerStat title="Protocol Compliance" value="100%" icon={<FileText />} theme="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-premium p-6 border border-border shadow-none bg-surface text-left">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-base font-medium font-sans text-textPrimary">Member Distribution</h3>
                        <div className="flex items-center gap-2 text-sm font-medium text-textSecondary uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-primary"></span> Active
                            <span className="w-2 h-2 rounded-full bg-border ml-4"></span> Inactive
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-3 px-4 overflow-hidden">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-background rounded-t-md relative group transition-all duration-500 hover:bg-primary/10">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-primary/60 rounded-t-md transition-all duration-1000 group-hover:bg-primary"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-premium p-6 border border-border shadow-none bg-surface text-left">
                    <h4 className="text-sm font-medium mb-6 font-sans uppercase tracking-widest text-textSecondary">Latest Protocols</h4>
                    <div className="space-y-4">
                        {policies.slice(0, 3).map(p => (
                            <div key={p.id} className="p-3 rounded-md border border-border bg-background/50 hover:bg-primary/5 transition-all group cursor-pointer">
                                <p className="text-sm font-medium text-textPrimary group-hover:text-primary">{p.title}</p>
                                <p className="text-sm uppercase tracking-widest text-textSecondary font-medium mt-1">{p.policy_type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDirectory = () => (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-medium tracking-tight text-textPrimary">Stakeholder Registry</h2>
                    <p className="text-sm font-medium text-textSecondary mt-0.5">Total operational members: {employees.length}</p>
                </div>
                <div className="flex items-center gap-4 bg-surface px-4 py-1.5 rounded-lg border border-border shadow-none w-full md:w-96 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <Search size={16} className="text-textSecondary" />
                    <input
                        type="text"
                        placeholder="Filter by name or identity..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-full py-1.5 placeholder:text-textSecondary"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-premium p-0 border border-border shadow-none overflow-hidden bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background/50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Stakeholder</th>
                                <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Identity Node</th>
                                <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Join Cycle</th>
                                <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="group hover:bg-background transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-md bg-background flex items-center justify-center font-medium text-textSecondary text-sm border border-border group-hover:bg-surface group-hover:scale-105 transition-all">
                                                {emp.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-textPrimary">{emp.full_name}</p>
                                                <p className="text-sm text-textSecondary font-medium uppercase">{emp.employee_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-textPrimary">{emp.designation}</p>
                                        <p className="text-sm text-textSecondary font-medium uppercase mt-1">{emp.employment_type}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-textSecondary">{emp.joined_on}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-md text-sm font-medium uppercase tracking-widest border",
                                            emp.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-background text-textSecondary border-border'
                                        )}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => setEditingEmployee(emp)}
                                                className="p-1.5 text-textSecondary hover:text-primary hover:bg-primary/10 rounded-md transition-all border border-transparent hover:border-primary/20"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                                                className="p-1.5 text-textSecondary hover:text-error hover:bg-error/10 rounded-md transition-all border border-transparent hover:border-error/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

    const renderPolicies = () => (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <h2 className="text-2xl font-bold tracking-tight">Organizational Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {policies.map(p => (
                    <Card key={p.id} className="card-premium group border border-border shadow-none bg-surface">
                        <CardHeader className="pb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform border border-primary/10">
                                <FileText size={18} />
                            </div>
                            <CardTitle className="text-base font-medium text-textPrimary">{p.title}</CardTitle>
                            <p className="text-sm font-medium uppercase tracking-widest text-textSecondary">{p.policy_type}</p>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-textSecondary leading-relaxed line-clamp-3 font-medium">{p.content}</p>
                            <button className="mt-6 text-sm font-medium text-primary uppercase tracking-widest flex items-center gap-2 hover:text-primaryLight transition-colors">
                                Review Protocol <ArrowLeft size={14} className="rotate-180" />
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <LayoutDashboard size={32} />
            </div>
            <div className="space-y-3">
                <h2 className="text-xl font-medium text-textPrimary font-sans">{title} Hub</h2>
                <p className="text-sm font-medium text-textSecondary max-w-sm mx-auto leading-relaxed">We are currently synchronizing this module with the central organization grid. Full operational status expected shortly.</p>
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
                    <Skeleton className="h-96 rounded-[2.5rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {currentView === 'overview' && renderOverview()}
                {currentView === 'directory' && renderDirectory()}
                {currentView === 'tasks' && <TaskManagementView isAdmin={true} />}
                {currentView === 'leaves' && <LeaveManagementView isAdmin={true} />}
                {currentView === 'policies' && renderPolicies()}
                {currentView === 'jobs' && renderPlaceholder('Recruitment')}
                {currentView === 'time' && renderPlaceholder('Time & Attendance')}
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

const ManagerStat = ({ title, value, icon, theme }: any) => {
    const isPrimary = theme === 'primary';
    const isWarning = theme === 'warning';

    return (
        <div className="card-premium p-6 group border border-border relative overflow-hidden bg-surface text-left">
            <div className={cn(
                "absolute top-0 right-0 p-4 opacity-5 transition-all group-hover:scale-125 duration-500",
                isPrimary ? "text-primary" : "text-warning"
            )}>
                {React.cloneElement(icon, { size: 60 })}
            </div>
            <div className="flex flex-col gap-6 relative z-10">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border",
                    isPrimary ? "bg-primary/10 text-primary border-primary/10" : "bg-warning/10 text-warning border-warning/10"
                )}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <div>
                    <p className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-lg font-medium text-textPrimary tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
