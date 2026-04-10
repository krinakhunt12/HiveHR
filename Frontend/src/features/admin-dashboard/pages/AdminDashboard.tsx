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
  Filter
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { useHealth, useListEmployees } from '@/shared/api/hooks/hrHooks';

import { AddEmployeeModal } from '../../company-dashboard/components/AddEmployeeModal';

const AdminDashboard = () => {
    const [query, setQuery] = React.useState('');
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const { data: health, isLoading: loadingHealth, error: healthError } = useHealth();
    const { data: employeesResponse, isLoading: loadingEmployees, error: employeesError } = useListEmployees();

    const employees = employeesResponse?.data || [];

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
          <div className="space-y-10">
              <div className="flex justify-between items-center">
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
                    <Skeleton className="h-[240px] rounded-xl" />
                    <Skeleton className="h-[240px] rounded-xl" />
                  </div>
              </div>
          </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="Global Administrator" userName="System Root" userInitials="SR">
        <div className="space-y-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">System Infrastructure</h1>
                    <p className="text-sm font-medium text-muted mt-0.5">Global clusters are reporting stable status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-medium text-xs h-9 border-border">
                         Maintenance
                    </Button>
                    <Button variant="default" size="sm" className="font-medium text-xs h-9 shadow-sm shadow-indigo-500/10">
                        Global Config
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox title="Active Tenants" value="2,104" icon={<Building2 className="text-primary/70" />} />
                <StatBox title="Global Traffic" value="84.2M" icon={<Users className="text-success/70" />} />
                <StatBox title="Total Records" value={String(employees.length)} icon={<Database className="text-warning/70" />} />
                <StatBox title="API Health" value={health?.ok ? 'Healthy' : 'Unknown'} icon={<Activity className="text-purple-500/70" />} />
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
                <Card className="lg:col-span-2 overflow-hidden border-soft">
                    <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-soft">
                        <CardTitle className="text-base font-semibold text-main">Global Directory</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => setIsAddModalOpen(true)} className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider">
                                <Users size={12} className="mr-1.5" /> Invite Global
                            </Button>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim w-3 h-3" />
                                <input
                                  type="text"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                                  placeholder="Search all..."
                                  className="pl-8 pr-3 py-1.5 bg-bg border border-soft rounded-lg text-xs outline-none w-28 focus:w-40 transition-all font-medium text-main placeholder:[var(--text-dim)]"
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
                                        <th className="px-6 py-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Tenant ID</th>
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
                                                <code className="text-[10px] font-mono text-muted bg-bg px-1.5 py-0.5 rounded border border-soft">{emp.company_id.slice(0, 8)}...</code>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                                                    emp.status === 'active' ? 'bg-success-bg text-success border border-success/10' : 'bg-error-bg text-error border border-error/10'
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
                    <Card className="border-soft">
                        <CardHeader className="py-5 border-b border-soft">
                            <CardTitle className="text-base font-semibold text-main">Security Pulse</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="p-4 rounded-xl border border-error/10 flex gap-4 bg-white hover:bg-bg transition-colors">
                                <Activity size={18} className="text-error/70" />
                                <div>
                                    <p className="text-sm font-medium text-main leading-none mb-1 text-left">Ingress Rate Limit</p>
                                    <p className="text-[11px] text-muted font-medium text-left">Spike in API cluster.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-warning/10 flex gap-4 bg-white hover:bg-bg transition-colors">
                                <Database size={18} className="text-warning/70" />
                                <div>
                                    <p className="text-sm font-medium text-main leading-none mb-1 text-left">Primary DB Snapshot</p>
                                    <p className="text-[11px] text-muted font-medium text-left">Snapshot delayed.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-soft">
                        <CardHeader className="py-5 border-b border-soft">
                            <CardTitle className="text-base font-semibold text-main">Core Versions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-left">
                            <div className="px-6 py-4 border-b border-soft hover:bg-bg transition-colors cursor-pointer">
                                <p className="text-sm font-medium text-main">Build v2.4.1</p>
                                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">PROD • 2h ago</p>
                            </div>
                            <div className="px-6 py-4 hover:bg-bg transition-colors cursor-pointer">
                                <p className="text-sm font-medium text-main">Build v2.4.0</p>
                                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">STAGING • 6h ago</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </DashboardLayout>
  );
};

const StatBox = ({ title, value, icon }: any) => (
    <Card className="hover:border-primary/10 transition-all border-soft">
        <CardContent className="p-6 flex items-center gap-5">
            <div className="p-2.5 bg-bg rounded-lg text-left">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div className="text-left">
                <p className="text-[11px] font-medium text-muted mb-1">{title}</p>
                <p className="text-xl font-semibold text-main tracking-tight leading-none">{value}</p>
            </div>
        </CardContent>
    </Card>
);

export default AdminDashboard;
