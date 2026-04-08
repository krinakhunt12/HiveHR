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
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useListEmployees, useListPolicies, useEmployeeMutations, type Employee, type CompanyPolicy } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';

type View = 'overview' | 'directory' | 'jobs' | 'time' | 'policies';

const CompanyDashboard = () => {
    const [currentView, setCurrentView] = useState<View>('overview');
    const [query, setQuery] = useState('');
    const { session } = useAuthStore();
    const { toast } = useToast();
    const companyId = session?.user?.company_id ?? undefined;

    const { data: employees = [], isLoading: loadingEmployees, error: employeesError } = useListEmployees(companyId);
    const { data: policies = [], isLoading: loadingPolicies, error: policiesError } = useListPolicies(companyId);
    const { remove: removeEmployee } = useEmployeeMutations();

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
        if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await removeEmployee.mutateAsync(id);
            toast({ title: 'Removed', description: `${name} has been taken off the roster.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to remove employee', type: 'error' });
        }
    }

    // --- SHARED COMPONENTS ---
    const navItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', path: 'overview' },
        { icon: <Users size={18} />, label: 'Directory', path: 'directory' },
        { icon: <Briefcase size={18} />, label: 'Jobs', path: 'jobs' },
        { icon: <Clock size={18} />, label: 'Time', path: 'time' },
        { icon: <FileText size={18} />, label: 'Policies', path: 'policies' },
    ];

    // Overriding the default Sidebar path behavior to use our internal state
    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => {
            setCurrentView(item.path as View);
            setQuery('');
        }
    }));

    // --- VIEW RENDERING ---

    const renderOverview = () => (
        <div className="space-y-10">
            <div className="flex justify-between items-center text-left">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Organization Overview</h1>
                    <p className="text-sm font-medium text-muted mt-0.5">Summary for {session?.user.company_name}.</p>
                </div>
                <Button onClick={() => setCurrentView('directory')} className="gap-2"><UserPlus size={16} /> Manage Members</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ManagerStat title="Total Members" value={String(employees.length)} icon={<Users className="text-primary/70" />} />
                <ManagerStat title="Active Members" value={String(activeEmployees)} icon={<Clock className="text-cyan-500/70" />} />
                <ManagerStat title="Policies" value={String(policies.length)} icon={<Calendar className="text-warning/70" />} />
                <ManagerStat title="Status" value="Healthy" icon={<AlertCircle className="text-emerald-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-soft overflow-hidden">
                    <CardHeader className="py-5 border-b border-soft flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Employees</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentView('directory')}>View All</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-bg/50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-soft">
                                {employees.slice(0, 5).map(emp => (
                                    <tr key={emp.id} className="hover:bg-bg transition-colors">
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-semibold">{emp.full_name}</p>
                                            <p className="text-[10px] text-muted font-medium uppercase">{emp.designation}</p>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}>
                                                <Trash2 size={12} className="text-rose-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <div className="space-y-6">
                     <Card className="border-soft p-6 bg-primary text-white">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Internal Update</p>
                        <h4 className="text-sm font-semibold leading-relaxed mb-4">Complete your Company Policy review by EOD Tuesday.</h4>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => setCurrentView('policies')}>Go to Policies</Button>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderDirectory = () => (
        <div className="space-y-10">
            <div className="flex items-center gap-4 text-left">
                <Button variant="ghost" size="icon" onClick={() => setCurrentView('overview')}><ArrowLeft size={18} /></Button>
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Member Directory</h1>
                    <p className="text-sm font-medium text-muted mt-0.5">Listing all {employees.length} employees found in {session?.user.company_name}.</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find an employee..."
                            className="pl-10 pr-4 py-2 bg-bg border border-soft rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <Card className="border-soft">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg/50 border-b border-soft">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Name & Role</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-soft">
                                {filteredEmployees.map((emp, i) => (
                                    <tr key={emp.id} className="group hover:bg-bg/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-400">
                                                    {emp.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-main">{emp.full_name}</p>
                                                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mt-0.5">{emp.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                                emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            )}>{emp.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 border-soft"><Edit3 size={14} /></Button>
                                                <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 border-soft" onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}><Trash2 size={14} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderPolicies = () => (
        <div className="space-y-10">
             <div className="text-left">
                <h1 className="text-2xl font-semibold text-main tracking-tight">Compliance & Policies</h1>
                <p className="text-sm font-medium text-muted mt-0.5">Standardized operating procedures for your organization.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map(policy => (
                    <Card key={policy.id} className="border-soft p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest py-1 px-2 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">{policy.policy_type}</span>
                            <span className={cn("w-2 h-2 rounded-full", policy.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300')}></span>
                        </div>
                        <h4 className="font-bold text-main mb-2 truncate">{policy.title}</h4>
                        <p className="text-xs text-muted line-clamp-3 leading-relaxed mb-6 font-medium">{policy.content}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-soft">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eff: {policy.effective_from || 'Always'}</p>
                             <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 text-primary">Read Document</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <LayoutDashboard size={40} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-main">{title} Control Center</h2>
                <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm">We are currently migrating your enterprise data for {title}. This section will be live shortly.</p>
             </div>
             <Button variant="outline" onClick={() => setCurrentView('overview')}>Back to Overview</Button>
        </div>
    );

    if (isLoading) {
        return (
            <DashboardLayout navItems={navItems as any}>
                <div className="space-y-10">
                    <Skeleton className="h-10 w-96 rounded-xl" />
                    <div className="grid grid-cols-4 gap-6">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {currentView === 'overview' && renderOverview()}
                {currentView === 'directory' && renderDirectory()}
                {currentView === 'policies' && renderPolicies()}
                {currentView === 'jobs' && renderPlaceholder('Recruitment')}
                {currentView === 'time' && renderPlaceholder('Time & Attendance')}
            </main>
        </DashboardLayout>
    );
};

const ManagerStat = ({ title, value, trend, icon }: any) => (
    <Card className="hover:border-primary/20 transition-all border-soft group shadow-sm hover:shadow-indigo-500/5">
        <CardContent className="p-8 text-left">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 rounded-xl transition-colors">
                    {React.cloneElement(icon, { size: 24, className: 'group-hover:text-indigo-600 transition-colors' })}
                </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-2xl font-bold text-main tracking-tighter leading-none">{value}</p>
        </CardContent>
    </Card>
);

const PolicyCard = ({ title, type, effectiveFrom, isActive }: { title: string; type: string; effectiveFrom: string | null; isActive: boolean }) => (
    <div className="p-4 bg-bg/50 border border-soft rounded-xl group hover:border-primary/10 transition-all text-left">
        <div className="flex justify-between items-center mb-4">
            <div>
                <p className="text-sm font-semibold text-main group-hover:text-primary transition-colors leading-none">{title}</p>
                <p className="text-[10px] font-medium text-muted mt-1 uppercase tracking-wider">{type}</p>
            </div>
            <span className="text-[10px] font-semibold text-muted bg-white px-2 py-0.5 rounded-md border border-soft">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <p className="text-[10px] text-muted font-medium">Effective: {effectiveFrom ?? 'N/A'}</p>
    </div>
);

export default CompanyDashboard;
