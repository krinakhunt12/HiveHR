import React from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAdminStats } from '../../hooks/api/useAdminQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const AdminDashboard = () => {
  const { data: adminData, isLoading, error } = useAdminStats();

  const stats = [
    {
      label: 'Total Employees',
      value: adminData?.stats?.totalEmployees || 0,
      icon: Users,
      trend: '+5.2%',
      trendUp: true
    },
    {
      label: 'Total HR Managers',
      value: adminData?.stats?.totalHR || 0,
      icon: ShieldCheck,
      trend: '+2.1%',
      trendUp: true
    },
    {
      label: 'Active Users',
      value: adminData?.stats?.activeUsers || 0,
      icon: Activity,
      trend: '98%',
      trendUp: true
    },
    {
      label: 'Inactive / Blocked',
      value: adminData?.stats?.inactiveUsers || 0,
      icon: UserPlus,
      trend: '2%',
      trendUp: false
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-foreground">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm">Global system status and workforce analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-8 h-8 rounded-full border-2 border-background" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">+12 Online</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="transition-all hover:border-foreground/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-secondary rounded-md">
                    <stat.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    stat.trendUp ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                    {stat.trend}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity */}
          <Card className="lg:col-span-2 shadow-none border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest system-wide events and audit logs.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">View All Logs</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-[120px]" />
                        <Skeleton className="h-2 w-[180px]" />
                      </div>
                      <Skeleton className="h-3 w-[40px]" />
                    </div>
                  ))
                ) : adminData?.recentActivity?.length > 0 ? (
                  adminData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground transition-all group-hover:bg-foreground group-hover:text-background">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold leading-none">{activity.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold">{activity.time}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5 font-medium">{activity.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">No recent activities on record.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-foreground text-background border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Actions</CardTitle>
              <CardDescription className="text-background/60 text-xs">Execute high-level administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-between h-11 px-4 hover:scale-[1.02] transition-transform" size="default">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <UserPlus className="w-3.5 h-3.5" />
                  Add HR Manager
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="secondary" className="w-full justify-between h-11 px-4 hover:scale-[1.02] transition-transform" size="default">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Security Audit
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="secondary" className="w-full justify-between h-11 px-4 hover:scale-[1.02] transition-transform" size="default">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Health Scan
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>

              <div className="mt-8 pt-6 border-t border-background/10 text-center">
                <p className="text-[9px] font-black text-background/30 uppercase tracking-[0.2em] mb-1">Architecture Protocol</p>
                <p className="text-xl font-black tracking-[0.3em] text-background/10">ROLL-V3</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;