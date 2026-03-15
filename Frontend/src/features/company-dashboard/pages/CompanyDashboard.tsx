import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Search,
  Check,
  X,
  Briefcase,
  Clock,
  Calendar,
  FileText,
  LayoutDashboard,
  Filter
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';

const CompanyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
            <p className="text-sm font-medium text-slate-400 mt-0.5">Manage your team and operations across 124 members.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-medium text-xs h-9">Export Data</Button>
             <Button size="sm" className="font-medium text-xs h-9 gap-2">
                <UserPlus size={14} /> Add Member
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ManagerStat title="Total Members" value="124" trend="+4" icon={<Users className="text-[var(--color-primary)]/70" />} />
            <ManagerStat title="Open Positions" value="08" trend="-2" icon={<Briefcase className="text-emerald-500/70" />} />
            <ManagerStat title="Approvals" value="14" icon={<Calendar className="text-[var(--color-warning-orange)]/70" />} />
            <ManagerStat title="Next Payroll" value="Mar 25" icon={<FileText className="text-indigo-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-50">
                    <CardTitle className="text-base font-semibold">Member Directory</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                            <input type="text" placeholder="Filter..." className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none w-28 focus:w-40 transition-all font-medium" />
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
                                {[
                                    { name: "Sarah Connor", role: "Product Design", dept: "Design", status: "Active", img: "32" },
                                    { name: "Marcus Wright", role: "Backend Dev", dept: "Engineering", status: "Onboarding", img: "12" },
                                    { name: "Kyle Reese", role: "Creative Strategy", dept: "Marketing", status: "Active", img: "53" },
                                    { name: "Emma Frost", role: "Talent Ops", dept: "People", status: "Time off", img: "44" }
                                ].map((emp, i) => (
                                    <tr key={i} className="hover:bg-slate-50/20 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-white">
                                                    <img src={`https://i.pravatar.cc/100?img=${emp.img}`} alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight leading-none">{emp.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{emp.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{emp.dept}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                                                emp.status === 'Active' ? 'bg-[var(--color-success-green)]/5 text-[var(--color-success-green)]' : 
                                                emp.status === 'Onboarding' ? 'bg-indigo-50 text-[var(--color-primary)]/80' : 
                                                'bg-[var(--color-warning-orange)]/5 text-[var(--color-warning-orange)]'
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
                        <CardTitle className="text-base font-semibold">Priority Approvals</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <ApprovalCard name="Emma Watson" type="Vacation" duration="3d" />
                        <ApprovalCard name="Michael J." type="Course Fee" duration="$450" />
                        <ApprovalCard name="David Miller" type="Sick Leave" duration="1d" />
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

const ApprovalCard = ({ name, type, duration }: any) => (
    <div className="p-4 bg-slate-50/50 border border-slate-100/50 rounded-xl group hover:border-[var(--color-primary)]/10 transition-all">
        <div className="flex justify-between items-center mb-4 text-left">
            <div>
                <p className="text-sm font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors leading-none">{name}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{type}</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">{duration}</span>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-grow h-8 text-[10px] font-semibold uppercase tracking-wider border-slate-200">
                <X size={12} className="text-rose-400 mr-2" /> Deny
            </Button>
            <Button size="sm" className="flex-grow h-8 text-[10px] font-semibold uppercase tracking-wider shadow-sm shadow-indigo-500/10">
                <Check size={12} className="text-white mr-2" /> Accept
            </Button>
        </div>
    </div>
);

export default CompanyDashboard;
