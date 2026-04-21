import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Building2,
    Users,
    Activity,
    Search,
    Filter,
    Shield,
    Zap,
    Wind,
    Clock
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useHealth, useListEmployees } from '@/shared/api/hooks/hrHooks';

import { AddEmployeeModal } from '../../company-dashboard/components/AddEmployeeModal';

type AdminTab = 'pulse' | 'directory';

const AdminDashboard = () => {
    const [currentTab, setCurrentTab] = useState<AdminTab>('pulse');
    const [query, setQuery] = React.useState('');
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    
    const { 
        data: health, 
        isLoading: loadingHealth, 
        error: healthError,
        refetch: refetchHealth 
    } = useHealth();
    
    const { 
        data: employeesResponse, 
        isLoading: loadingEmployees, 
        error: employeesError,
        refetch: refetchEmployees 
    } = useListEmployees();

    const employees = employeesResponse?.data || [];

    const isLoading = loadingHealth || loadingEmployees;
    const error = healthError || employeesError;

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
        { icon: <Activity />, label: 'Pulse', path: 'pulse' },
        { icon: <Users />, label: 'Global Registry', path: 'directory' },
    ];

    const customNavItems = navItems.map(item => ({
        ...item,
        onClick: () => setCurrentTab(item.path as AdminTab)
    }));

    const renderPulse = () => {
        if (error) {
            return (
                <div className="min-h-[600px] flex items-center justify-center">
                    <ErrorState 
                        error={error as Error} 
                        onRetry={() => {
                            refetchHealth();
                            refetchEmployees();
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="space-y-10 text-left animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-textPrimary tracking-tight font-display">Enterprise Collective Pulse</h1>
                        <p className="text-sm font-semibold text-textSecondary mt-1 opacity-70">Cross-tenant personnel and lifecycle telemetry.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title="Active Personnel" value={String(employees.length)} icon={<Users />} trend="+12% YoY" color="primary" />
                    <StatBox title="Global Attendance" value="98.2%" icon={<Clock />} trend="Stable" color="accent" />
                    <StatBox title="Leave Requests" value="142" icon={<Wind />} trend="Active" color="primary" />
                    <StatBox title="Cluster Sync" value={health?.ok ? 'Live' : 'Syncing'} icon={<Zap />} trend="99.9% Latency" color="primary" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                         <Card className="overflow-hidden card-premium bg-white">
                            <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b border-primary/5 bg-primary/[0.02]">
                                <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                    <Building2 size={18} className="text-primary" /> Active Tenants Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    {[
                                        { name: 'AgriCorp Global', role: 'Enterprise', status: 'Healthy', sync: '100%' },
                                        { name: 'SeedLogic Ltd', role: 'Medium Business', status: 'Healthy', sync: '99.8%' },
                                        { name: 'FarmFlow Systems', role: 'Regional', status: 'Maintenance', sync: '0%' }
                                    ].map((tenant, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 hover:bg-primary/[0.01] transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-primary border border-primary/10">
                                                    {tenant.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{tenant.name}</p>
                                                    <p className="text-[10px] uppercase tracking-widest text-textSecondary font-black opacity-40 mt-1">{tenant.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn("text-xs font-bold", tenant.status === 'Healthy' ? 'text-success' : 'text-warning')}>{tenant.status}</p>
                                                <p className="text-[10px] font-black text-textSecondary/40 uppercase tracking-widest mt-1">Sync: {tenant.sync}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="card-premium bg-gradient-to-br from-primary to-primaryDark text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative">
                             <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Shield size={120} />
                            </div>
                            <CardContent className="p-8 pb-10">
                                <Zap size={24} className="mb-6 opacity-60" />
                                <h3 className="text-xl font-bold tracking-tight mb-2">Registry Security</h3>
                                <p className="text-sm font-medium text-white/70 leading-relaxed">System-wide encryption is active for all employee and attendance records (AES-256).</p>
                                <Button variant="outline" className="w-full mt-8 border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest">
                                    Review Encryption Logs
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="card-premium bg-white overflow-hidden">
                            <CardHeader className="py-6 px-8 border-b border-primary/5 bg-primary/[0.02]">
                                <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                    <Activity size={18} className="text-primary" /> Personnel Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-textSecondary uppercase tracking-widest opacity-50 mb-6">Cross-Tenant Growth</p>
                                    {[70, 45, 90, 60, 85].map((w, i) => (
                                        <div key={i} className="h-2 bg-primary/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${w}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight font-display">Global Personnel Registry</h2>
                    <p className="text-sm font-semibold text-textSecondary mt-1 opacity-70">Auditing members across all enterprise tenants.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary/40 w-4 h-4" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search globally..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-primary/5 rounded-xl text-sm outline-none w-64 focus:w-80 transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-11 w-11 p-0 rounded-xl border-primary/5 text-textSecondary bg-white shadow-sm"><Filter size={18} /></Button>
                </div>
            </div>

            <Card className="card-premium p-0 border border-primary/5 shadow-xl shadow-primary/[0.02] overflow-hidden bg-white">
                <CardContent className="p-0 min-h-[500px]">
                    {filteredEmployees.length === 0 ? (
                        <EmptyState 
                            title={query ? "No search results" : "Global Directory Empty"} 
                            description={query ? `No members found matching "${query}".` : "The global registry doesn't have any members yet."}
                            icon={Users}
                            className="h-[500px]"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-primary/[0.02] border-b border-primary/5">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Member Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Tenant Association</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] text-right">Registry Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredEmployees.map((emp, i) => (
                                        <tr key={emp.id} className="hover:bg-primary/[0.01] transition-colors cursor-pointer group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-sm group-hover:scale-110 transition-all shadow-sm">
                                                        {emp.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors tracking-tight leading-none">{emp.full_name}</p>
                                                        <p className="text-[10px] text-textSecondary mt-2 font-black uppercase tracking-widest opacity-50">{emp.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <code className="text-xs font-mono text-primary font-bold bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">TENANT_{emp.company_id.slice(0, 8).toUpperCase()}</code>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
                                                    emp.status === 'active' ? 'bg-success/5 text-success border-success/10' : 'bg-error/5 text-error border-error/10'
                                                )}>{emp.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading) {
        return (
            <DashboardLayout navItems={customNavItems as any}>
                <div className="space-y-10">
                    <div className="flex justify-between items-center text-left">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-80 rounded-2xl" />
                            <Skeleton className="h-5 w-64 rounded-xl" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                    <Skeleton className="h-[600px] rounded-[2rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={customNavItems as any}>
            <main>
                {currentTab === 'pulse' && renderPulse()}
                {currentTab === 'directory' && renderDirectory()}
            </main>
            <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </DashboardLayout>
    );
};

const StatBox = ({ title, value, icon, trend, color }: any) => {
    const isAccent = color === 'accent';
    return (
        <Card className="hover:border-primary/20 transition-all duration-300 card-premium bg-white group relative overflow-hidden text-left shadow-none border border-primary/5">
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-5 transition-opacity duration-700 group-hover:opacity-20",
                isAccent ? "bg-accent" : "bg-primary"
            )} />
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                        "p-3 rounded-xl transition-all duration-300 shadow-sm",
                        isAccent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    )}>
                        {React.cloneElement(icon, { size: 20 })}
                    </div>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        isAccent ? "bg-accent/5 text-accent" : "bg-primary/5 text-primary"
                    )}>
                        {trend}
                    </span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] mb-2 opacity-50">{title}</p>
                    <p className="text-3xl font-bold text-textPrimary tracking-tight font-display">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminDashboard;


