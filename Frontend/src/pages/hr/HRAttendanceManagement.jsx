import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Clock,
    Calendar as CalendarIcon,
    User,
    MoreHorizontal,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabaseClient';

const HRAttendanceManagement = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAttendance = async () => {
        setLoading(true);
        // In a real app, you'd join with profiles. Suboptimal but working for demo:
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                profiles:user_id (full_name, employee_id)
            `)
            .order('date', { ascending: false });

        if (data) setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Records</h1>
                        <p className="text-slate-500 font-medium mt-1">Global log of all employee clock-in/out events.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by employee name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all text-sm font-bold border border-slate-200/50">
                            <CalendarIcon className="w-4 h-4" />
                            This Week
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all text-sm font-bold border border-slate-200/50">
                            <Filter className="w-4 h-4" />
                            Status: All
                        </button>
                    </div>
                </div>

                {/* Log Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Punch In</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Punch Out</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Hours</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-bold">Scanning Biometric Data...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-bold font-mono">NO LOGS DETECTED</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100">
                                                {log.profiles?.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight">{log.profiles?.full_name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{log.profiles?.employee_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-700">{log.date}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-emerald-600">{log.check_in || '--:--'}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-rose-600">{log.check_out || '--:--'}</td>
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-600">{log.total_hours || '0'}h</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {log.check_out ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Complete
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                    <Clock className="w-3 h-3" />
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRAttendanceManagement;
