import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import {
    Building2, Users, Activity, Search, Filter,
    Shield, Zap, Clock, TrendingUp, Globe, 
    ArrowUpRight, ArrowDownRight, MoreHorizontal,
    ExternalLink, AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton, SkeletonCard, SkeletonPageHeader, SkeletonList } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
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
        try {
            await suspend.mutateAsync(id);
            toast({ title: 'Company Suspended', description: `${name} has been suspended successfully.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message, type: 'error' });
        }
    };

    const handleActivate = async (id: string, name: string) => {
        try {
            await activate.mutateAsync(id);
            toast({ title: 'Company Activated', description: `${name} is now active on the platform.`, type: 'success' });
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message, type: 'error' });
        }
    };

    const navItems = [
        { icon: <Activity size={18} />, label: 'Pulse', path: 'pulse' },
        { icon: <Users size={18} />, label: 'Tenants', path: 'directory' },
    ].map(item => ({ ...item, onClick: () => setCurrentTab(item.path as AdminTab) }));

    const renderPulse = () => {
        if (error) {
            return (
                <div className="p-8">
                    <ErrorState 
                        error={error as Error} 
                        onRetry={() => { refetchStats(); refetchCompanies(); }} 
                        title="Platform Telemetry Offline"
                        description="We encountered an issue while aggregating cross-tenant data."
                    />
                </div>
            );
        }

        return (
            <div className="p-6 md:p-8 space-y-10 text-left animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Platform Intelligence</h1>
                        <p className="text-sm font-medium text-textSecondary mt-1.5">Real-time cross-tenant performance and subscription telemetry.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" size="lg" className="h-11 px-6 rounded-xl font-bold border-border bg-white shadow-sm hover:shadow-md transition-all gap-2">
                            <Globe size={18} /> Global Audit
                        </Button>
                        <Button size="lg" className="h-11 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all gap-2">
                            <Zap size={18} /> System Diagnostics
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatBox 
                        title="Registered Tenants" 
                        value={String(stats?.total_companies ?? companies.length)} 
                        icon={<Building2 />} 
                        trend="+12.5%" 
                        positive={true} 
                    />
                    <StatBox 
                        title="Active Subscriptions" 
                        value={String(stats?.active_companies ?? companies.filter((c: any) => c.plan_status === 'active').length)} 
                        icon={<Zap />} 
                        trend="94.2%" 
                        positive={true} 
                    />
                    <StatBox 
                        title="Total Personnel" 
                        value={String(stats?.total_employees ?? '—')} 
                        icon={<Users />} 
                        trend="+4.1k" 
                        positive={true} 
                    />
                    <StatBox 
                        title="Subscription Alerts" 
                        value={String((stats?.expiring_subscriptions?.length ?? stats?.expiring_soon ?? '0'))} 
                        icon={<Clock />} 
                        trend="Next 7 days" 
                        positive={false} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <Card className="rounded-3xl border-border/40 shadow-sm bg-white overflow-hidden relative group">
                            <CardHeader className="flex flex-row items-center justify-between py-8 px-10 border-b border-border/20 bg-surface/50">
                                <CardTitle className="text-xs font-bold text-textSecondary uppercase tracking-widest flex items-center gap-3">
                                    <TrendingUp size={16} className="text-primary" /> Cross-Tenant Activity
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-textSecondary hover:text-primary rounded-lg">
                                    View Detailed Metrics <ArrowUpRight size={12} className="ml-1" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {companies.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <EmptyState title="No active tenants" description="Companies will appear here once they onboard on the platform." icon={Building2} className="border-none shadow-none" />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {companies.slice(0, 5).map((company: any) => (
                                            <div key={company.id} className="flex items-center justify-between p-8 hover:bg-surface/50 transition-all group/item">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-surface border border-border/40 flex items-center justify-center font-bold text-primary text-base shadow-inner group-hover/item:scale-110 transition-transform">
                                                        {company.name?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary group-hover/item:text-primary transition-colors">{company.name}</p>
                                                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mt-2">
                                                            {company.plans?.name ?? 'No Plan'} · <span className="text-primary/60">{company.employee_count ?? 0} members</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <Badge 
                                                        variant="outline"
                                                        className={cn(
                                                            "px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] border shadow-none",
                                                            company.plan_status === 'active' ? "bg-success/10 text-success border-success/20" :
                                                            company.plan_status === 'suspended' ? "bg-error/10 text-error border-error/20" :
                                                            "bg-warning/10 text-warning border-warning/20"
                                                        )}
                                                    >
                                                        {company.plan_status}
                                                    </Badge>
                                                    
                                                    {company.plan_status === 'active' ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleSuspend(company.id, company.name)}
                                                            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-error/20 text-error hover:bg-error/5 hover:border-error/40 transition-all shadow-none">
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleActivate(company.id, company.name)}
                                                            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-success/20 text-success hover:bg-success/5 hover:border-success/40 transition-all shadow-none">
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

                    <div className="space-y-10">
                        <Card className="rounded-3xl bg-slate-900 p-10 text-white border-none overflow-hidden relative group shadow-2xl">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Shield size={160} strokeWidth={1} />
                            </div>
                            <CardContent className="p-0 space-y-10 relative z-10">
                                <div className="p-4 bg-white/10 w-fit rounded-2xl border border-white/10 shadow-inner">
                                    <Shield size={28} className="text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tight">Infrastructure Pulse</h3>
                                    <p className="text-sm font-medium text-white/60 leading-relaxed">Multi-tenant data isolation is currently being enforced via RLS on all 16 core database clusters.</p>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                                    Security Core Operational
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl bg-white border-border/40 shadow-sm overflow-hidden group">
                            <CardHeader className="py-6 px-8 border-b border-border/20 bg-surface/50">
                                <CardTitle className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={14} className="text-primary" /> Subscription Mix
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {stats?.plan_distribution ? (
                                    <div className="space-y-6">
                                        {Object.entries(stats.plan_distribution).map(([plan, count]: any) => (
                                            <div key={plan} className="space-y-2.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-textSecondary">{plan}</span>
                                                    <span className="text-primary">{count} Units</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border/10">
                                                    <div 
                                                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                                                        style={{ width: `${(count / (stats.total_companies || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 flex flex-col items-center justify-center text-center">
                                        <AlertCircle size={24} className="text-textSecondary/20 mb-4" />
                                        <p className="text-[10px] font-bold text-textSecondary/40 uppercase tracking-widest">No plan data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-textPrimary">Company Registry</h2>
                    <p className="text-sm font-medium text-textSecondary mt-1.5">{companies.length} registered tenants across regions.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary/40 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tenants..."
                            className="pl-12 pr-6 py-3.5 bg-white border border-border/60 rounded-2xl text-sm outline-none w-72 md:w-96 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-[52px] w-[52px] rounded-2xl border-border/60 text-textSecondary bg-white shadow-sm hover:bg-surface transition-all">
                        <Filter size={20} />
                    </Button>
                </div>
            </div>

            <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden bg-white min-h-[600px]">
                <CardContent className="p-0">
                    {filteredCompanies.length === 0 ? (
                        <div className="p-32">
                            <EmptyState
                                title={query ? 'No results found' : 'Registry Empty'}
                                description={query ? `We couldn't find any tenants matching "${query}".` : 'The company registry will populate once organizations onboard.'}
                                icon={Building2}
                                className="border-none shadow-none"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border/40">
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Organization</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Service Plan</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Headcount</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Renewal</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredCompanies.map((company: any) => (
                                        <tr key={company.id} className="hover:bg-surface/50 transition-all group/row cursor-pointer">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-surface border border-border/40 flex items-center justify-center font-bold text-primary text-base shadow-inner group-hover/row:bg-primary group-hover/row:text-white transition-all duration-300">
                                                        {company.name?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary group-hover/row:text-primary transition-colors">{company.name}</p>
                                                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mt-2">{company.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <Badge className="bg-primary/10 text-primary border-none shadow-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                                    {company.plans?.name ?? 'No Plan'}
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-7">
                                                <p className="text-sm font-bold text-textPrimary tracking-tight">{company.employee_count ?? 0}</p>
                                            </td>
                                            <td className="px-10 py-7">
                                                <Badge 
                                                    variant="outline"
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full font-bold uppercase tracking-[0.15em] text-[9px] border shadow-none",
                                                        company.plan_status === 'active' ? "bg-success/5 text-success border-success/20" :
                                                        company.plan_status === 'suspended' ? "bg-error/5 text-error border-error/20" :
                                                        "bg-warning/5 text-warning border-warning/20"
                                                    )}
                                                >
                                                    {company.plan_status}
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-7">
                                                <p className="text-sm font-bold text-textPrimary tracking-tight">
                                                    {company.plan_end_date ? new Date(company.plan_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </p>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/5 transition-all">
                                                        <ExternalLink size={18} />
                                                    </Button>
                                                    {company.plan_status === 'active' ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleSuspend(company.id, company.name)}
                                                            className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-error/20 text-error hover:bg-error/5 transition-all shadow-none">
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleActivate(company.id, company.name)}
                                                            className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-success/20 text-success hover:bg-success/5 transition-all shadow-none">
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
                <div className="p-8 space-y-12">
                    <SkeletonPageHeader />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} className="h-44" />)}
                    </div>
                    <Skeleton className="h-[600px] rounded-[3rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems as any}>
            <main className="animate-in fade-in duration-500 min-h-[80vh]">
                {currentTab === 'pulse' && renderPulse()}
                {currentTab === 'directory' && renderDirectory()}
            </main>
        </DashboardLayout>
    );
};

const StatBox = ({ title, value, icon, trend, positive }: any) => {
    return (
        <Card className="rounded-3xl p-10 group relative overflow-hidden bg-white border-border/40 shadow-sm hover:shadow-lg transition-all duration-500 text-left">
            <div className="absolute -bottom-8 -right-8 p-6 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 text-primary">
                {React.cloneElement(icon, { size: 180 })}
            </div>
            <div className="flex flex-col gap-10 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                        {React.cloneElement(icon, { size: 28 })}
                    </div>
                    <Badge 
                        variant="outline"
                        className={cn(
                            "px-3 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px] border shadow-none",
                            positive ? "bg-success/5 text-success border-success/20" : "bg-warning/5 text-warning border-warning/20"
                        )}
                    >
                        {trend}
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-3">{title}</p>
                    <p className="text-4xl font-bold text-textPrimary tracking-tighter leading-none">{value}</p>
                </div>
            </div>
        </Card>
    );
};

export default AdminDashboard;
