import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/shared/layouts/DashboardLayout';
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  ArrowUpRight, 
  MessageSquare
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/utils/cn';


const EmployeeDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { icon: <Clock size={20} />, label: 'Dashboard', path: '/dashboard/employee' },
    { icon: <Calendar size={20} />, label: 'Leave', path: '#' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', path: '#' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '#' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout 
        navItems={navItems} 
        userRole="Employee" 
        userName="John Doe" 
        userInitials="JD"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      navItems={navItems} 
      userRole="Employee" 
      userName="John Doe" 
      userInitials="JD"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good Morning, John</h1>
            <p className="text-sm font-medium text-slate-500">Here's your schedule for today, March 15.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="font-bold">Request Leave</Button>
             <Button className="font-bold">Clock In</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Attendance" value="98%" icon={<Clock className="text-indigo-600" />} trend="+2.4%" />
            <StatCard title="Leave Balance" value="12 Days" icon={<Calendar className="text-emerald-600" />} />
            <StatCard title="Pending Tasks" value="05" icon={<CheckSquare className="text-amber-600" />} />
            <StatCard title="Messages" value="03" icon={<MessageSquare className="text-purple-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-slate-100">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                    <CardTitle className="text-base font-bold">Upcoming Tasks</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600">View All</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <TaskItem title="Submit Q1 Self-Assessment" category="Performance" due="2 days" priority="high" />
                    <TaskItem title="Verify March Payslip Data" category="Payroll" due="5 days" priority="medium" />
                    <TaskItem title="Complete Security Training" category="Training" due="1 week" priority="high" />
                </CardContent>
            </Card>

            <Card className="border-slate-100">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <CardTitle className="text-base font-bold tracking-tight">Daily Hours</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Work Hours</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">38h / 40h</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Week Progress</span>
                            <span>95%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, trend }: any) => (
    <Card className="border-slate-100">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{title}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </CardContent>
    </Card>
);

const TaskItem = ({ title, category, due, priority }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-2 h-2 rounded-full",
                priority === 'high' ? 'bg-rose-500' : 'bg-amber-400'
            )}></div>
            <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{category} • DUE IN {due}</p>
            </div>
        </div>
        <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
);

export default EmployeeDashboard;
