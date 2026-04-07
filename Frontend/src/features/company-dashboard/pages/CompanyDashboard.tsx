import React, { useMemo } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { type CompanyPolicy, type Employee } from '@/shared/api/hrApi';
import { useListEmployees, useListPolicies } from '@/shared/api/hooks/hrHooks';
import { getAuthSession } from '@/shared/auth/session';

const CompanyDashboard = () => {
    const [query, setQuery] = React.useState('');
    const session = getAuthSession();
    const companyNameFromSession = session?.user?.company_name ?? undefined;
    const companyId = session?.user?.company_id ?? undefined;

    const { data: employees = [], isLoading: loadingEmployees, error: employeesError } = useListEmployees(companyId);
    const { data: policies = [], isLoading: loadingPolicies, error: policiesError } = useListPolicies(companyId);

    const isLoading = loadingEmployees || loadingPolicies;
    const error = (employeesError as any)?.message ?? (policiesError as any)?.message ?? null;

    const filteredEmployees = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return employees;

        return employees.filter((emp) => {
            return (
                emp.full_name.toLowerCase().includes(normalized)
                || emp.designation.toLowerCase().includes(normalized)
                || (emp.employee_code ?? '').toLowerCase().includes(normalized)
            );
        });
    }, [employees, query]);

    const activeEmployees = employees.filter((item) => item.status === 'active').length;
    const policyCount = policies.length;

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/dashboard/company' },
    { icon: <Users size={18} />, label: 'Directory', path: '#' },
    { icon: <Briefcase size={18} />, label: 'Jobs', path: '#' },
    { icon: <Clock size={18} />, label: 'Time', path: '#' },
    { icon: <Calendar size={18} />, label: 'Calendar', path: '#' },
    { icon: <FileText size={18} />, label: 'Files', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="Admin" userName="Sarah Jenkins" userInitials="SJ">
        <div className="space-y-10">
            <div className="flex justify-between items-center text-left">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-6">
                <Skeleton className="col-span-2 h-[500px] rounded-xl" />
                <div className="space-y-6">
                    <Skeleton className="h-[220px] rounded-xl" />
                    <Skeleton className="h-[220px] rounded-xl" />
                </div>
            </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="VP People" userName="Sarah Jenkins" userInitials="SJ">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div>
                        <h1 className="text-2xl font-semibold text-main tracking-tight">Organization Overview</h1>
                        <p className="text-sm font-medium text-muted mt-0.5">Manage your team at {companyNameFromSession ?? 'your company'}.</p>
                    </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-medium text-xs h-9 border-border">Export Data</Button>
             <Button variant="default" size="sm" className="font-medium text-xs h-9 gap-2 shadow-sm shadow-indigo-500/10">
                <UserPlus size={14} /> Add Member
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ManagerStat title="Total Members" value={String(employees.length)} icon={<Users className="text-primary/70" />} />
                        <ManagerStat title="Active Members" value={String(activeEmployees)} icon={<Clock className="text-cyan-500/70" />} />
            <ManagerStat title="Open Positions" value="08" trend="-2" icon={<Briefcase className="text-emerald-500/70" />} />
                        <ManagerStat title="Company Policies" value={String(policyCount)} icon={<Calendar className="text-warning/70" />} />
                        <ManagerStat title="Next Payroll" value="Mar 25" icon={<FileText className="text-indigo-400" />} />
        </div>

                {error && (
                    <Card className="border-error/20 bg-error-bg">
                        <CardContent className="p-4 flex items-center gap-3 text-error">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-soft">
                <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-soft">
                    <CardTitle className="text-base font-semibold text-main">Member Directory</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim w-3 h-3" />
                            <input
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Filter..."
                              className="pl-8 pr-3 py-1.5 bg-bg border border-soft rounded-lg text-xs outline-none w-28 focus:w-40 transition-all font-medium text-main"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-7 w-7 p-0 rounded-md border-border"><Filter size={12} /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg/50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-soft">
                                {filteredEmployees.map((emp, i) => (
                                    <tr key={emp.id} className="hover:bg-bg transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-bg overflow-hidden border border-white">
                                                    <img src={`https://i.pravatar.cc/100?img=${(i % 70) + 1}`} alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-main group-hover:text-primary transition-colors tracking-tight leading-none">{emp.full_name}</p>
                                                    <p className="text-[10px] text-muted mt-1 font-medium">{emp.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-medium text-muted uppercase tracking-wide">{emp.department_id ? `Dept ${emp.department_id.slice(0, 6)}` : 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                                                emp.status === 'active' ? 'bg-success-bg text-success border border-success/10' : 
                                                'bg-warning-bg text-warning border border-warning/10'
                                            )}>{emp.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                  <tr>
                                    <td colSpan={3} className="px-6 py-6 text-center text-xs text-muted">No employees found.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6 text-left">
                <Card className="border-soft">
                    <CardHeader className="py-5 border-b border-soft">
                        <CardTitle className="text-base font-semibold text-main text-left">Company Policies</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {policies.slice(0, 3).map((policy) => (
                          <PolicyCard
                            key={policy.id}
                            title={policy.title}
                            type={policy.policy_type}
                            effectiveFrom={policy.effective_from}
                            isActive={policy.is_active}
                          />
                        ))}
                        {policies.length === 0 && (
                          <p className="text-xs text-muted">No policies found for this company.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-sidebar border-0 p-1">
                    <CardContent className="p-6 text-left">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 mb-2">Manager Tip</p>
                        <h4 className="text-sm font-medium text-white leading-relaxed mb-4">Review Q3 goals for the Design team. High turnover risk detected.</h4>
                        <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold uppercase tracking-widest h-9 border-0">View Strategy</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ManagerStat = ({ title, value, trend, icon }: any) => (
    <Card className="hover:border-primary/10 transition-all border-soft">
        <CardContent className="p-6 text-left">
            <div className="flex justify-between items-start mb-5">
                <div className="p-2 bg-bg rounded-lg">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        trend.startsWith('+') ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
                    )}>{trend}</span>
                )}
            </div>
            <p className="text-xs font-medium text-muted mb-1">{title}</p>
            <p className="text-xl font-semibold text-main tracking-tight leading-none">{value}</p>
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
