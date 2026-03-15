import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  TrendingUp, 
  Search,
  MoreVertical,
  Check,
  X,
  Briefcase,
  Clock,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';
import { LayoutDashboard } from 'lucide-react';


const CompanyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard/company' },
    { icon: <Users size={20} />, label: 'Employees', path: '#' },
    { icon: <Briefcase size={20} />, label: 'Recruitment', path: '#' },
    { icon: <Clock size={20} />, label: 'Attendance', path: '#' },
    { icon: <Calendar size={20} />, label: 'Leave Management', path: '#' },
    { icon: <FileText size={20} />, label: 'Payroll', path: '#' },
    { icon: <BarChart3 size={20} />, label: 'Performance', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} userRole="HR Manager" userName="Sarah Jenkins" userInitials="SJ">
        <div className="space-y-8">
            <div className="flex justify-between items-center"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-40" /></div>
            <div className="grid grid-cols-4 gap-6"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
            <div className="grid grid-cols-3 gap-8"><Skeleton className="col-span-2 h-[500px] rounded-2xl" /><Skeleton className="h-[500px] rounded-2xl" /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userRole="HR Manager" userName="Sarah Jenkins" userInitials="SJ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HR Console: Acme Corp</h1>
            <p className="text-sm font-medium text-slate-500">Global overview for 124 employees.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="font-bold">Export Logs</Button>
             <Button className="font-bold gap-2"><UserPlus size={18} /> New Hire</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <ManagerStat title="Total Employees" value="124" trend="+4" icon={<Users className="text-indigo-600" />} />
            <ManagerStat title="Active Roles" value="12" trend="stable" icon={<Briefcase className="text-emerald-600" />} />
            <ManagerStat title="Pending Leaves" value="09" icon={<Calendar className="text-amber-600" />} />
            <ManagerStat title="Payroll Month" value="$84k" trend="+2%" icon={<FileText className="text-purple-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-slate-100">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                    <CardTitle className="text-base font-bold">Recent Hires</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-32 focus:w-48 transition-all" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { name: "Sarah Connor", role: "Designer", dept: "Design", status: "Active", img: "32" },
                                { name: "Marcus Wright", role: "Engineer", dept: "Eng", status: "Onboarding", img: "12" },
                                { name: "Kyle Reese", role: "Marketing", dept: "Mktg", status: "Active", img: "53" }
                            ].map((emp, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${emp.img}`} alt="" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-none">{emp.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{emp.role}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{emp.dept}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>{emp.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="border-slate-100">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <ApprovalCard name="Emma Watson" type="Annual Leave" duration="3d" />
                        <ApprovalCard name="Michael J." type="Sick Leave" duration="1d" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ManagerStat = ({ title, value, trend, icon }: any) => (
    <Card className="border-slate-100 hover:border-indigo-100 transition-colors">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-black text-indigo-600">{trend}</span>}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{title}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </CardContent>
    </Card>
);

const ApprovalCard = ({ name, type, duration }: any) => (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="flex justify-between items-center mb-3">
            <div>
                <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
                <p className="text-[10px] font-bold text-indigo-600 mt-1">{type}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{duration}</span>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-grow h-8 text-[10px] font-bold uppercase"><Check className="w-3 h-3 text-emerald-600 mr-1" /> Approve</Button>
            <Button size="sm" variant="outline" className="flex-grow h-8 text-[10px] font-bold uppercase"><X className="w-3 h-3 text-rose-600 mr-1" /> Deny</Button>
        </div>
    </div>
);

export default CompanyDashboard;
