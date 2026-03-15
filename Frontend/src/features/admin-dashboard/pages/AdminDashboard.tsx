import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Server,
  ShieldAlert,
  Globe,
  Database,
  Unplug
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { icon: <Activity size={18} />, label: 'Pulse', path: '/dashboard/admin' },
    { icon: <Building2 size={18} />, label: 'Tenants', path: '#' },
    { icon: <Database size={18} />, label: 'Data', path: '#' },
    { icon: <Globe size={18} />, label: 'Traffic', path: '#' },
    { icon: <Server size={18} />, label: 'Resources', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="Root" userName="Infrastructure" userInitials="IR">
          <Skeleton className="h-[500px] rounded-xl" />
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
                        <Unplug size={14} className="mr-2" /> Maintenance
                    </Button>
                    <Button size="sm" className="font-medium text-xs h-9 shadow-sm shadow-indigo-500/10">
                        <Server size={16} className="mr-2" /> Global Config
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStat title="Active Tenants" value="2,104" icon={<Building2 className="text-[var(--color-primary)]/70" />} />
                <AdminStat title="Global Traffic" value="84.2M" icon={<Users className="text-emerald-500/70" />} />
                <AdminStat title="System MRR" value="$420.5k" icon={<CreditCard className="text-amber-500/70" />} />
                <AdminStat title="Uptime" value="99.99%" icon={<Activity className="text-purple-500/70" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="py-5 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">Security Pulse</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                         <div className="space-y-6">
                            <AlertItem type="error" title="Ingress Rate Limit" message="Spike detected in API cluster 'east-dev-01'. Automated mitigation active." />
                            <AlertItem type="warning" title="Primary DB Snapshot" message="The daily RDS snapshot for node-72 is currently 4 hours behind." />
                            <AlertItem type="success" title="CDN Synchronization" message="Static assets for build v2.4.1 propagated to 142 edge nodes." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-5 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">Core Versions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50/80">
                            <DeployItem version="Build v2.4.1" time="2h ago" status="Success" />
                            <DeployItem version="Build v2.4.0" time="6h ago" status="Success" />
                            <DeployItem version="Build v2.3.9" time="1d ago" status="Success" />
                            <DeployItem version="Build v2.3.8" time="2d ago" status="Success" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </DashboardLayout>
  );
};

const AdminStat = ({ title, value, icon }: any) => (
    <Card className="hover:border-[var(--color-primary)]/10">
        <CardContent className="p-6 flex items-center gap-5">
            <div className="p-2.5 bg-slate-50 rounded-lg">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[11px] font-medium text-slate-400 mb-1">{title}</p>
                <p className="text-xl font-semibold text-[var(--color-text-main)] tracking-tight leading-none">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const AlertItem = ({ type, title, message }: any) => (
    <div className={cn(
        "p-5 rounded-xl border flex gap-4 bg-white hover:bg-slate-50/30 transition-colors",
        type === 'error' ? 'border-rose-100/60' : 
        type === 'warning' ? 'border-amber-100/60' : 
        'border-emerald-100/60'
    )}>
        <ShieldAlert size={18} className={cn(
            "shrink-0 mt-0.5",
            type === 'error' ? 'text-rose-400' : 
            type === 'warning' ? 'text-amber-400' : 
            'text-emerald-400'
        )} />
        <div>
            <p className="text-sm font-medium text-[var(--color-text-main)] tracking-tight leading-none mb-2">{title}</p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed opacity-80">{message}</p>
        </div>
    </div>
);

const DeployItem = ({ version, time, status }: any) => (
    <div className="px-6 py-5 flex items-center justify-between hover:bg-slate-50/20 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-green)]/80"></div>
            <div>
                <p className="text-sm font-medium text-[var(--color-text-main)] tracking-tight">{version}</p>
                <p className="text-[11px] text-slate-400 font-medium">{time}</p>
            </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{status}</span>
    </div>
);

export default AdminDashboard;
