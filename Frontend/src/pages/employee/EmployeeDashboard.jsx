import React from 'react';
import {
    Clock,
    Calendar,
    Zap,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    Coffee,
    Moon,
    Sun
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useEmployee } from '../../hooks/useEmployee';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useToast } from '../../hooks/useToast';

const EmployeeDashboard = () => {
    const { profile } = useSupabaseAuth();
    const { loading, attendanceToday, stats, clockIn, clockOut } = useEmployee();
    const { showToast } = useToast();

    const handleClockAction = async () => {
        if (!attendanceToday) {
            const success = await clockIn();
            if (success) showToast('Clocked in successfully!', 'success');
        } else if (!attendanceToday.check_out_time) {
            const success = await clockOut();
            if (success) showToast('Clocked out successfully!', 'success');
        }
    };

    const stats_cards = [
        {
            label: 'Attendance Rate',
            value: '98%',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Leaves Taken',
            value: stats.presentDays > 0 ? '2 Days' : '0 Days',
            icon: Calendar,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Sync Status',
            value: 'Cloud Active',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-12">
                {/* Greeting Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Workspace / Personal</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Namaste, {profile?.full_name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-slate-500 font-medium">Have a productive day at the office.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className={`p-4 rounded-xl ${attendanceToday ? (attendanceToday.check_out_time ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600') : 'bg-emerald-50 text-emerald-600'}`}>
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Session</p>
                            <p className="text-base font-bold text-slate-900">
                                {attendanceToday ? (attendanceToday.check_out_time ? 'Shift Completed' : 'Shift Active') : 'No active shift'}
                            </p>
                        </div>
                        <button
                            onClick={handleClockAction}
                            disabled={loading || (attendanceToday && attendanceToday.check_out_time)}
                            className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${attendanceToday
                                    ? (attendanceToday.check_out_time ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-200')
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200'
                                }`}
                        >
                            {loading ? 'Processing...' : (attendanceToday ? (attendanceToday.check_out_time ? 'Done for today' : 'Clock Out') : 'Check In')}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats_cards.map((card, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-3xl font-black text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    Weekly Productivity
                                </h2>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">Jan 14 - Jan 20</span>
                            </div>

                            <div className="flex items-end justify-between h-48 gap-2">
                                {[65, 80, 45, 90, 70, 85, 30].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="relative w-full">
                                            <div
                                                style={{ height: `${height}%` }}
                                                className={`w-full max-w-[40px] mx-auto rounded-t-xl transition-all duration-500 group-hover:opacity-80 cursor-pointer ${i === 6 ? 'bg-slate-200' : 'bg-indigo-500 shadow-lg shadow-indigo-100'}`}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Timeline */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                            <h2 className="text-xl font-bold mb-8">Quick Navigation</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Apply Leave', icon: Moon, color: 'bg-indigo-500' },
                                    { label: 'View Payslips', icon: Zap, color: 'bg-emerald-500' },
                                    { label: 'My Reviews', icon: BarChart3, color: 'bg-amber-500' },
                                    { label: 'Directory', icon: Sun, color: 'bg-rose-500' }
                                ].map((item, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                        <div className={`p-3 rounded-xl ${item.color} text-white transition-transform group-hover:scale-110`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side Panel: Daily Routine */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-amber-500" />
                                Tasks Today
                            </h3>
                            <div className="space-y-4">
                                {[
                                    'Clock in via Dashboard',
                                    'Review weekly KPI metrics',
                                    'Complete daily status report'
                                ].map((task, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl group cursor-pointer hover:bg-slate-50 transition-all">
                                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-400 transition-all">
                                            {i === 0 && attendanceToday && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>}
                                        </div>
                                        <span className={`text-sm font-bold ${i === 0 && attendanceToday ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{task}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest group">
                                View Full Planner
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </section>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
                            <h3 className="text-lg font-bold mb-2">Company Policy</h3>
                            <p className="text-white/60 text-sm font-medium mb-6">New remote work guidelines have been updated for Q1 2024. Please review them.</p>
                            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                                Read Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;
