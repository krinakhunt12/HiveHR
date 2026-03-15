import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Server,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { icon: <Activity size={20} />, label: 'Dashboard', path: '/dashboard/admin' },
    { icon: <Building2 size={20} />, label: 'Companies', path: '#' },
    { icon: <Users size={20} />, label: 'Users', path: '#' },
    { icon: <CreditCard size={20} />, label: 'Billing', path: '#' },
    { icon: <Server size={20} />, label: 'System', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="Admin" userName="System Admin" userInitials="SA">
          <Skeleton className="h-[600px] rounded-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="Admin" userName="System Admin" userInitials="SA">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-sm font-medium text-slate-500">System health and global stats.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold">Error Logs</Button>
                    <Button className="font-bold gap-2"><Server size={18} /> Settings</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <AdminStat title="Companies" value="2,104" icon={<Building2 className="text-indigo-600" />} />
                <AdminStat title="Active Users" value="84k" icon={<Users className="text-emerald-600" />} />
                <AdminStat title="MRR" value="$420k" icon={<CreditCard className="text-amber-600" />} />
                <AdminStat title="Uptime" value="99.9%" icon={<Activity className="text-purple-600" />} />
            </div>

            <Card className="border-slate-100">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <CardTitle className="text-base font-bold">System Alerts</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <AlertItem type="error" title="Auth Service Latency" message="Spike in JWT validation times in EU-West-1." />
                        <AlertItem type="warning" title="Database Backup" message="Scheduled backup completed with 2 minor warnings." />
                    </div>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
};

const AdminStat = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card className="border-slate-100">
        <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const AlertItem = ({ type, title, message }: { type: 'error' | 'warning', title: string, message: string }) => (
    <div className={cn(
        "p-4 rounded-xl border flex gap-4",
        type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-amber-50 border-amber-100 text-amber-900'
    )}>
        <ShieldAlert size={20} className={type === 'error' ? 'text-rose-600' : 'text-amber-600'} />
        <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs opacity-70 font-medium">{message}</p>
        </div>
    </div>
);

export default AdminDashboard;
