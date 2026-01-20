import React from 'react';
import {
    Users,
    Clock,
    Calendar,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useLeaves } from '../../hooks/useLeaves';
import { useHR } from '../../hooks/useHR';

const HRDashboard = () => {
    const { leaves } = useLeaves();
    const { stats: hrStats, loading } = useHR();

    const stats_cards = [
        {
            label: 'Total Workforce',
            value: hrStats.totalEmployees,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+2 New',
            trendUp: true
        },
        {
            label: 'Present Today',
            value: hrStats.presentToday || '0',
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Live',
            trendUp: true
        },
        {
            label: 'Leave Requests',
            value: hrStats.pendingLeaves,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            trend: 'Urgent',
            trendUp: false
        },
        {
            label: 'Approved Leaves',
            value: hrStats.approvedLeaves,
            icon: Calendar,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: 'Monthly',
            trendUp: true
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">HR Intelligence Suite</h1>
                        <p className="text-slate-500 font-medium mt-1">Operational overview and talent management metrics.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-sm font-bold text-slate-700">System Live</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats_cards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Applications / Leaves */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Pending Leave Decisions
                            </h2>
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                                View Full Queue
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {leaves.filter(l => l.status === 'pending').slice(0, 3).map((leave, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-slate-400">
                                            {leave.user_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">{leave.user_name || 'Anonymous User'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{leave.type}</span>
                                                <span className="text-xs font-medium text-slate-400">• {leave.duration} Days</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all">Approve</button>
                                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Review</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workforce Analysis Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/20"></div>

                        <div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-4">Workforce Sentiment</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Analytics suggest a 12% improvement in employee satisfaction after the new wellness initiative.
                            </p>
                        </div>

                        <div className="mt-12 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                                    <span>Team Morale</span>
                                    <span className="text-indigo-400">88%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }}></div>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-900/50">
                                Generate Insight Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
