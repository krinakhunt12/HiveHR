import React, { useState, useEffect, useMemo } from 'react';
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
import { hrApi, type CompanyPolicy, type Employee } from '@/shared/api/hrApi';
import { getAuthSession } from '@/shared/auth/session';

const CompanyDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
    const session = getAuthSession();
    const companyNameFromSession = session?.user?.company_name ?? undefined;

  useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // Use company_id and company_name from the stored login session (do not call /me)
                const session = getAuthSession();
                const companyId = session?.user?.company_id ?? undefined;

                if (!companyId) {
                    setError('No company is mapped to your account.');
                    setIsLoading(false);
                    return;
                }

                const [employeeRes, policyRes] = await Promise.all([
                    hrApi.listEmployees(companyId),
                    hrApi.listPolicies(companyId),
                ]);

                if (!isMounted) return;
                setEmployees(employeeRes.data);
                setPolicies(policyRes.data);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load company dashboard data.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
  }, []);

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
        <div className="space-y-8">
            <div className="flex justify-between items-center"><Skeleton className="h-9 w-64" /><Skeleton className="h-9 w-32" /></div>
            <div className="grid grid-cols-4 gap-6"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-6"><Skeleton className="col-span-2 h-[450px] rounded-xl" /><Skeleton className="h-[450px] rounded-xl" /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="VP People" userName="Sarah Jenkins" userInitials="SJ">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--color-text-main)] tracking-tight">Organization Overview</h1>
                        <p className="text-sm font-medium text-slate-400 mt-0.5">Manage your team at {companyNameFromSession ?? 'your company'}.</p>
                    </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-medium text-xs h-9">Export Data</Button>
             <Button size="sm" className="font-medium text-xs h-9 gap-2">
                <UserPlus size={14} /> Add Member
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ManagerStat title="Total Members" value={String(employees.length)} icon={<Users className="text-[var(--color-primary)]/70" />} />
                        <ManagerStat title="Active Members" value={String(activeEmployees)} icon={<Clock className="text-cyan-500/70" />} />
            <ManagerStat title="Open Positions" value="08" trend="-2" icon={<Briefcase className="text-emerald-500/70" />} />
                        <ManagerStat title="Company Policies" value={String(policyCount)} icon={<Calendar className="text-[var(--color-warning-orange)]/70" />} />
                        <ManagerStat title="Next Payroll" value="Mar 25" icon={<FileText className="text-indigo-400" />} />
        </div>

                {error && (
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="p-4 flex items-center gap-3 text-rose-700">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-50">
                    <CardTitle className="text-base font-semibold">Member Directory</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                            <input
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Filter..."
                              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none w-28 focus:w-40 transition-all font-medium"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md"><Filter size={12} /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {filteredEmployees.map((emp, i) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/20 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-white">
                                                    <img src={`https://i.pravatar.cc/100?img=${(i % 70) + 1}`} alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight leading-none">{emp.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{emp.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{emp.department_id ? `Dept ${emp.department_id.slice(0, 6)}` : 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                                                emp.status === 'active' ? 'bg-[var(--color-success-green)]/5 text-[var(--color-success-green)]' : 
                                                emp.status === 'on_leave' ? 'bg-[var(--color-warning-orange)]/5 text-[var(--color-warning-orange)]' : 
                                                'bg-[var(--color-warning-orange)]/5 text-[var(--color-warning-orange)]'
                                            )}>{emp.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                  <tr>
                                    <td colSpan={3} className="px-6 py-6 text-center text-xs text-slate-400">No employees found.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader className="py-5 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">Company Policies</CardTitle>
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
                          <p className="text-xs text-slate-400">No policies found for this company.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-0 p-1">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Manager Tip</p>
                        <h4 className="text-sm font-medium text-white leading-relaxed mb-4">Review Q3 goals for the Design team. High turnover risk detected.</h4>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold uppercase tracking-widest h-9 border-0">View Strategy</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ManagerStat = ({ title, value, trend, icon }: any) => (
    <Card className="hover:border-[var(--color-primary)]/10">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        trend.startsWith('+') ? 'bg-[var(--color-success-green)]/5 text-[var(--color-success-green)]' : 'bg-rose-50 text-rose-500'
                    )}>{trend}</span>
                )}
            </div>
            <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-xl font-semibold text-[var(--color-text-main)] tracking-tight leading-none">{value}</p>
        </CardContent>
    </Card>
);

const PolicyCard = ({ title, type, effectiveFrom, isActive }: { title: string; type: string; effectiveFrom: string | null; isActive: boolean }) => (
    <div className="p-4 bg-slate-50/50 border border-slate-100/50 rounded-xl group hover:border-[var(--color-primary)]/10 transition-all">
        <div className="flex justify-between items-center mb-4 text-left">
            <div>
                <p className="text-sm font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors leading-none">{title}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{type}</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">Effective: {effectiveFrom ?? 'N/A'}</p>
    </div>
);

export default CompanyDashboard;
