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
  Filter,
  AlertCircle,
  Trash2,
  Edit3,
  ArrowLeft,
  Wind,
  Target
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useListEmployees, useListPolicies, useEmployeeMutations, type Employee, type CompanyPolicy } from '@/shared/api/hooks/hrHooks';
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
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight font-sans">Ecosystem Overview</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1">Real-time vitals for your agricultural organization.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-slate-200 hover:border-emerald-200">Generate Report</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                        <UserPlus size={18} />
                        Add Stakeholder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ManagerStat title="Active Stakeholders" value={String(activeEmployees)} icon={<Users />} theme="emerald" />
                <ManagerStat title="Workload Index" value="92%" icon={<Clock />} theme="amber" />
                <ManagerStat title="Upcoming Cycles" value="12" icon={<Calendar />} theme="emerald" />
                <ManagerStat title="Protocol Compliance" value="100%" icon={<FileText />} theme="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-premium p-8 border-none shadow-premium bg-white text-left">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold font-sans">Member Distribution</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            <span className="w-2 h-2 rounded-full bg-slate-200 ml-4"></span> Inactive
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-4 px-4 overflow-hidden">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group transition-all duration-500 hover:bg-emerald-50">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-2xl transition-all duration-1000 group-hover:bg-emerald-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-premium p-8 border-none shadow-premium bg-white text-left">
                    <h4 className="text-sm font-bold mb-6 font-sans">Latest Protocols</h4>
                    <div className="space-y-4">
                        {policies.slice(0, 3).map(p => (
                            <div key={p.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                                <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">{p.title}</p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-2">{p.policy_type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDirectory = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h2 className="text-2xl font-bold tracking-tight">Stakeholder Registry</h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Total operational members: {employees.length}</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                    <Search size={18} className="text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Filter by name or identity..." 
                        className="bg-transparent border-none outline-none text-sm font-medium w-full py-2 placeholder:text-slate-300"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-premium p-0 border-none shadow-premium overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stakeholder</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Node</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Join Cycle</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="group hover:bg-emerald-50/30 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all">
                                                {emp.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{emp.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.employee_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-700">{emp.designation}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{emp.employment_type}</p>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{emp.joined_on}</td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                        )}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => setEditingEmployee(emp)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
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
                    <Card key={p.id} className="card-premium group border-none shadow-premium bg-white">
                        <CardHeader className="pb-2">
                           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                           </div>
                           <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.policy_type}</p>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{p.content}</p>
                            <button className="mt-6 text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
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
             <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner">
                <LayoutDashboard size={40} />
             </div>
             <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[var(--text-main)] font-sans">{title} Hub</h2>
                <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">We are currently synchronizing this module with the central organization grid. Full operational status expected shortly.</p>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                    <p className="text-2xl font-bold text-[var(--text-main)] tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
