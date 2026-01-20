import React from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAdmin } from '../../hooks/useAdmin';

const AdminDashboard = () => {
  const { adminData, loading } = useAdmin();

  const stats = [
    {
      label: 'Total Employees',
      value: adminData?.stats?.totalEmployees || '0',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+5.2%',
      trendUp: true
    },
    {
      label: 'Total HR Managers',
      value: adminData?.stats?.totalHR || '0',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+2.1%',
      trendUp: true
    },
    {
      label: 'Active Users',
      value: adminData?.stats?.activeUsers || '0',
      icon: Activity,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      trend: '98%',
      trendUp: true
    },
    {
      label: 'Inactive / Blocked',
      value: adminData?.stats?.inactiveUsers || '0',
      icon: UserPlus,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      trend: '2%',
      trendUp: false
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
            <p className="text-slate-500 mt-1 font-medium">Global system status and workforce analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">+12 Online</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics / Activity */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Activity
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Log</button>
            </div>

            <div className="space-y-6">
              {adminData.recentActivity.length > 0 ? (
                adminData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-500 transition-all">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                      <p className="text-xs font-medium text-slate-500">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">{activity.time}</p>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 font-bold">No recent activities on record.</div>
              )}
            </div>
          </div>

          {/* Quick Access / Roles Distribution */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              <button className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Add New HR</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </button>
              <button className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Security Audit</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </button>
              <button className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-bold">System Health</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Version</p>
              <p className="text-lg font-black tracking-widest text-white/40">v2.4.0-GOLD</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;