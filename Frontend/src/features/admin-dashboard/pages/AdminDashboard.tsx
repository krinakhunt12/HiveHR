import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Building2, Users, Activity, Search, Filter,
    Shield, Zap, Clock, TrendingUp
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useAdminDashboard, useListCompanies, useCompanyAdminMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';

type AdminTab = 'pulse' | 'directory';

const AdminDashboard = () => {
    const [currentTab, setCurrentTab] = useState<AdminTab>('pulse');
    const [query, setQuery] = React.useState('');
    const { toast } = useToast();

    const { data: stats, isLoading: loadingStats, error: statsError, refetch: refetchStats } = useAdminDashboard();
    const { data: companiesRes, isLoading: loadingCompanies, error: companiesError, refetch: refetchCompanies } = useListCompanies();
    const { suspend, activate } = useCompanyAdminMutations();

    const companies = companiesRes?.data ?? [];
    const isLoading = loadingStats || loadingCompanies;
    const error = statsError || companiesError;

    const filteredCompanies = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return companies;
        return companies.filter((c: any) =>
            c.name?.toLowerCase().includes(normalized) ||
            c.email?.toLowerCase().includes(normalized)
        );
    }, [companies, query]);

    const handleSuspend = async (id: string, name: string) => {
        if (!window.confirm(`Suspend ${name}? Their employees will lose access.`)) return;
        try {
            await suspend.mutateAsync(id);
            toast({ title: 'Company Suspended', description: `${name} has been suspended.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message, type: 'error' });
        }
    };

    const handleActivate = async (id: string, name: string) => {
        try {
            await activate.mutateAsync(id);
            toast({ title: 'Company Activated', description: `${name} is now active.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message, type: 'error' });
        }
    };

    const navItems = [
        { icon: <Activity />, label: 'Pulse', path: 'pulse' },
        { icon: <Users />, label: 'Companies', path: 'directory' },
    ].map(item => ({ ...item, onClick: () => setCurrentTab(item.path as AdminTab) }));

    const renderPulse = () => {
        if (error) {
            return (
                <div className="min-h-[600px] flex items-center justify-center">
                    <ErrorState error={error as Error} onRetry={() => { refetchStats(); refetchCompanies(); }} />
                </div>
            );
        }

        return (
            <div className="space-y-10 text-left animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-textPrimary tracking-tight font-display">Platform Overview</h1>
                        <p className="text-sm font-semibold text-textSecondary mt-1 opacity-70">Cross-tenant performance and subscription telemetry.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title="Total Companies" value={String(stats?.total_companies ?? companies.length)} icon={<Building2 />} trend="Registered" color="primary" />
                    <StatBox title="Active Subscriptions" value={String(stats?.active_companies ?? companies.filter((c: any) => c.plan_status === 'active').length)} icon={<Zap />} trend="Live" color="primary" />
                    <StatBox title="Total Employees" value={String(stats?.total_employees ?? '—')} icon={<Users />} trend="Platform-wide" color="accent" />
                    <StatBox title="Expiring Soon" value={String((stats?.expiring_subscriptions?.length ?? stats?.expiring_soon ?? '—'))} icon={<Clock />} trend="< 7 days" color="primary" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="overflow-hidden card-premium bg-white">
                            <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b border-primary/5 bg-primary/[0.02]">
                                <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                    <Building2 size={18} className="text-primary" /> Active Tenants
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {companies.length === 0 ? (
                                    <EmptyState title="No companies yet" description="Companies will appear here once they register." icon={Building2} />
                                ) : (
                                    <div className="space-y-4">
                                        {companies.slice(0, 5).map((company: any) => (
                                            <div key={company.id} className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 hover:bg-primary/[0.01] transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-primary border border-primary/10">
                                                        {company.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary">{company.name}</p>
                                                        <p className="text-xs uppercase tracking-widest text-textSecondary font-black opacity-40 mt-1">
                                                            {company.plans?.name ?? 'No Plan'} · {company.employee_count ?? 0} employees
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-xs font-bold px-2 py-1 rounded-lg border",
                                                        company.plan_status === 'active' ? 'bg-success/5 text-success border-success/10' :
                                                            company.plan_status === 'suspended' ? 'bg-error/5 text-error border-error/10' :
                                                                'bg-warning/5 text-warning border-warning/10'
                                                    )}>
                                                        {company.plan_status}
                                                    </span>
                                                    {company.plan_status === 'active' ? (
                                                        <Button variant="ghost" size="sm"
                                                            onClick={() => handleSuspend(company.id, company.name)}
                                                            className="text-xs text-error hover:bg-error/5 h-7">
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm"
                                                            onClick={() => handleActivate(company.id, company.name)}
                                                            className="text-xs text-success hover:bg-success/5 h-7">
                                                            Activate
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="card-premium bg-gradient-to-br from-primary to-primaryDark text-white border-none overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 opacity-10"><Shield size={120} /></div>
                            <CardContent className="p-8 pb-10">
                                <Zap size={24} className="mb-6 opacity-60" />
                                <h3 className="text-xl font-bold tracking-tight mb-2">Platform Security</h3>
                                <p className="text-sm font-medium text-white/70 leading-relaxed">Multi-tenant data isolation enforced via RLS on all 16 database tables.</p>
                                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/60">
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    All systems operational
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-premium bg-white overflow-hidden">
                            <CardHeader className="py-6 px-8 border-b border-primary/5 bg-primary/[0.02]">
                                <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                    <TrendingUp size={18} className="text-primary" /> Plan Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {stats?.plan_distribution ? (
                                    <div className="space-y-3">
                                        {Object.entries(stats.plan_distribution).map(([plan, count]: any) => (
                                            <div key={plan} className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">{plan}</span>
                                                <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">{count} companies</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-textSecondary opacity-50 text-center py-4">No plan data available</p>
                                )}
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
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight font-display">Company Registry</h2>
                    <p className="text-sm font-semibold text-textSecondary mt-1 opacity-70">{companies.length} registered tenants.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary/40 w-4 h-4" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search companies..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-primary/5 rounded-xl text-sm outline-none w-64 focus:w-80 transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-11 w-11 p-0 rounded-xl border-primary/5 text-textSecondary bg-white shadow-sm">
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            <Card className="card-premium p-0 border border-primary/5 overflow-hidden bg-white">
                <CardContent className="p-0 min-h-[500px]">
                    {filteredCompanies.length === 0 ? (
                        <EmptyState
                            title={query ? 'No results' : 'No companies yet'}
                            description={query ? `No companies match "${query}".` : 'Companies will appear here once they register.'}
                            icon={Building2}
                            className="h-[500px]"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-primary/[0.02] border-b border-primary/5">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em]">Company</th>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em]">Plan</th>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em]">Employees</th>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em]">Expiry</th>
                                        <th className="px-8 py-5 text-xs font-black text-textSecondary uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredCompanies.map((company: any) => (
                                        <tr key={company.id} className="hover:bg-primary/[0.01] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-sm">
                                                        {company.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary">{company.name}</p>
                                                        <p className="text-xs text-textSecondary font-black uppercase tracking-widest mt-1 opacity-50">{company.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                                    {company.plans?.name ?? 'No Plan'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-textPrimary">{company.employee_count ?? 0}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.15em] border shadow-sm",
                                                    company.plan_status === 'active' ? 'bg-success/5 text-success border-success/10' :
                                                        company.plan_status === 'suspended' ? 'bg-error/5 text-error border-error/10' :
                                                            'bg-warning/5 text-warning border-warning/10'
                                                )}>
                                                    {company.plan_status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-textPrimary">
                                                    {company.plan_end_date ? new Date(company.plan_end_date).toLocaleDateString() : '—'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {company.plan_status === 'active' ? (
                                                        <Button variant="ghost" size="sm"
                                                            onClick={() => handleSuspend(company.id, company.name)}
                                                            className="text-xs text-error hover:bg-error/5 h-8">
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm"
                                                            onClick={() => handleActivate(company.id, company.name)}
                                                            className="text-xs text-success hover:bg-success/5 h-8">
                                                            Activate
                                                        </Button>
                                                    )}
                                                </div>
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
            <DashboardLayout navItems={navItems as any}>
                <div className="space-y-10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-80 rounded-2xl" />
                            <Skeleton className="h-5 w-64 rounded-xl" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-[500px] rounded-[2rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems as any}>
            <main>
                {currentTab === 'pulse' && renderPulse()}
                {currentTab === 'directory' && renderDirectory()}
            </main>
        </DashboardLayout>
    );
};

const StatBox = ({ title, value, icon, trend, color }: any) => {
    const isAccent = color === 'accent';
    return (
        <Card className="hover:border-primary/20 transition-all duration-300 card-premium bg-white group relative overflow-hidden text-left shadow-none border border-primary/5">
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-5 transition-opacity duration-700 group-hover:opacity-20", isAccent ? "bg-accent" : "bg-primary")} />
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className={cn("p-3 rounded-xl transition-all duration-300 shadow-sm", isAccent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
                        {React.cloneElement(icon, { size: 20 })}
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg", isAccent ? "bg-accent/5 text-accent" : "bg-primary/5 text-primary")}>
                        {trend}
                    </span>
                </div>
                <div>
                    <p className="text-xs font-black text-textSecondary uppercase tracking-[0.2em] mb-2 opacity-50">{title}</p>
                    <p className="text-3xl font-bold text-textPrimary tracking-tight font-display">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminDashboard;
