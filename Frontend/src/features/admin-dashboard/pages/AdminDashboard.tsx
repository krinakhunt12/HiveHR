import React, { useMemo } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Building2, 
  Users, 
  Activity, 
  Server,
  Database,
  AlertCircle,
  Search,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useHealth, useListEmployees } from '@/shared/api/hooks/hrHooks';

const AdminDashboard = () => {
    const [query, setQuery] = React.useState('');
    const { data: health, isLoading: loadingHealth, error: healthError } = useHealth();
    const { data: employees = [], isLoading: loadingEmployees, error: employeesError } = useListEmployees();

    const isLoading = loadingHealth || loadingEmployees;
    const error = (healthError as any)?.message ?? (employeesError as any)?.message ?? null;

    const filteredEmployees = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return employees;

        return employees.filter((emp) => {
            return (
                emp.full_name.toLowerCase().includes(normalized)
                || emp.designation.toLowerCase().includes(normalized)
                || (emp.employee_code ?? '').toLowerCase().includes(normalized)
                || (emp.company_id ?? '').toLowerCase().includes(normalized)
            );
        });
    }, [employees, query]);

  const navItems = [
    { icon: <Activity size={18} />, label: 'Pulse', path: '/dashboard/admin' },
    { icon: <Building2 size={18} />, label: 'Tenants', path: '#' },
    { icon: <Database size={18} />, label: 'Data', path: '#' },
    { icon: <Server size={18} />, label: 'Resources', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="Root" userName="Infrastructure" userInitials="IR">
          <div className="space-y-8">
              <Skeleton className="h-9 w-64" />
              <div className="grid grid-cols-4 gap-6">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
              </div>
              <Skeleton className="h-[400px] rounded-xl" />
          </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="Global Administrator" userName="System Root" userInitials="SR">
        <div className="space-y-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text-main)] tracking-tight">System Infrastructure</h1>
                    <p className="text-sm font-medium text-slate-400 mt-0.5">Global clusters are reporting stable status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-medium text-xs h-9 border-slate-200">
                         Maintenance
                    </Button>
                    <Button size="sm" className="font-medium text-xs h-9 shadow-sm shadow-indigo-500/10">
                        Global Config
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox title="Active Tenants" value="2,104" icon={<Building2 className="text-[var(--color-primary)]/70" />} />
                <StatBox title="Global Traffic" value="84.2M" icon={<Users className="text-emerald-500/70" />} />
                <StatBox title="Total Records" value={String(employees.length)} icon={<Database className="text-amber-500/70" />} />
                <StatBox title="API Health" value={health?.ok ? 'Healthy' : 'Unknown'} icon={<Activity className="text-purple-500/70" />} />
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
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">Global Directory</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                                <input
                                  type="text"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  placeholder="Search all..."
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
                                        <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tenant ID</th>
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
                                                <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{emp.company_id.slice(0, 8)}...</code>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                                                    emp.status === 'active' ? 'bg-[var(--color-success-green)]/5 text-[var(--color-success-green)]' : 'bg-rose-50 text-rose-500'
                                                )}>{emp.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="py-5 border-b border-slate-50">
                            <CardTitle className="text-base font-semibold">Security Pulse</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="p-4 rounded-xl border border-rose-100/60 flex gap-4 bg-white">
                                <Activity size={18} className="text-rose-400" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 leading-none mb-1 text-left">Ingress Rate Limit</p>
                                    <p className="text-[11px] text-slate-400 font-medium text-left">Spike in API cluster.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-amber-100/60 flex gap-4 bg-white">
                                <Database size={18} className="text-amber-400" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 leading-none mb-1 text-left">Primary DB Snapshot</p>
                                    <p className="text-[11px] text-slate-400 font-medium text-left">Snapshot delayed.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-5 border-b border-slate-50">
                            <CardTitle className="text-base font-semibold">Core Versions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-left">
                            <div className="px-6 py-4 border-b border-slate-50">
                                <p className="text-sm font-medium text-slate-900">Build v2.4.1</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PROD • 2h ago</p>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-sm font-medium text-slate-900">Build v2.4.0</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">STAGING • 6h ago</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </DashboardLayout>
  );
};

const StatBox = ({ title, value, icon }: any) => (
    <Card className="hover:border-[var(--color-primary)]/10">
        <CardContent className="p-6 flex items-center gap-5">
            <div className="p-2.5 bg-slate-50 rounded-lg text-left">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div className="text-left">
                <p className="text-[11px] font-medium text-slate-400 mb-1">{title}</p>
                <p className="text-xl font-semibold text-slate-900 tracking-tight leading-none">{value}</p>
            </div>
        </CardContent>
    </Card>
);

export default AdminDashboard;
