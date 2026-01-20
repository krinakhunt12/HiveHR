import React, { useState } from 'react';
import {
    Inbox,
    CheckCircle2,
    XCircle,
    Search,
    Calendar,
    Filter,
    MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useLeaves } from '../../hooks/useLeaves';
import { useToast } from '../../hooks/useToast';

const HRLeaveManagement = () => {
    const { leaves, loading, approveLeave, rejectLeave } = useLeaves();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') await approveLeave(id);
            else await rejectLeave(id);
            showToast(`Leave ${action}d successfully`, 'success');
        } catch (err) {
            showToast(`Failed to ${action} leave`, 'error');
        }
    };

    const filteredLeaves = leaves.filter(l => {
        const matchesSearch = l.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leave Control Center</h1>
                        <p className="text-slate-500 font-medium mt-1">Global management of workforce time-off requests.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find application by employee name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                        />
                    </div>
                    <div className="flex gap-3">
                        {['all', 'pending', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${filterStatus === status
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leave Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-400 font-bold">Synchronizing with HR Database...</div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-400 font-bold">Inbox empty. No requests found.</div>
                    ) : filteredLeaves.map((leave) => (
                        <div key={leave.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 flex flex-col h-full group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100 group-hover:scale-110 transition-transform">
                                        {leave.user_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{leave.user_name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Emp Category: {leave.type}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${leave.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                        leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {leave.status}
                                </span>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration & Date</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {leave.start_date} → {leave.duration} Days
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Employee Remark</p>
                                    <p className="text-sm font-medium text-slate-600 italic bg-slate-50/50 p-4 rounded-2xl">
                                        "{leave.reason || 'No reason provided.'}"
                                    </p>
                                </div>
                            </div>

                            {leave.status === 'pending' && (
                                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                    <button
                                        onClick={() => handleAction(leave.id, 'reject')}
                                        className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-400 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(leave.id, 'approve')}
                                        className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Approve
                                    </button>
                                </div>
                            )}

                            {leave.status !== 'pending' && (
                                <div className="flex items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Decision Logged
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRLeaveManagement;
