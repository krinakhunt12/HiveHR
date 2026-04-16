import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    MoreVertical,
    Plus
} from 'lucide-react';
import { useListLeaves, useLeaveMutations, type LeaveRequest } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { LeaveRequestModal } from '../components/LeaveRequestModal';

interface LeaveManagementViewProps {
    isAdmin: boolean;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ isAdmin }) => {
    const { session } = useAuthStore();
    const { toast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // If admin, we don't pass employee_id to see all, but the API might need company_id
    const params = isAdmin ? { company_id: session?.user?.company_id } : {};
    const { data: leavesResponse, isLoading, refetch } = useListLeaves(params);
    const { review } = useLeaveMutations();

    const leaves = leavesResponse?.data || [];

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await review.mutateAsync({ id, payload: { status } });
            toast({
                title: status === 'approved' ? 'Request Authorized' : 'Request Terminated',
                description: `Cycle maintenance request for the stakeholder has been ${status}.`,
                type: status === 'approved' ? 'success' : 'error'
            });
            refetch();
        } catch (err: any) {
            toast({ title: 'Operation Failed', description: err.message || 'Failed to update request', type: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight font-sans">Lifecycle Maintenance</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        {isAdmin ? 'Review and manage time-off requests across the ecosystem.' : 'Manage your personal maintenance cycles and scheduled absences.'}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        Request Maintenance
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-premium p-6 bg-white border-none shadow-premium">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Quota Allocation</h4>
                        <div className="space-y-4">
                            <QuotaProgress label="Paid (Annual)" used={12} total={24} color="emerald" />
                            <QuotaProgress label="Health (Sick)" used={3} total={10} color="amber" />
                            <QuotaProgress label="Unpaid Personal" used={2} total={5} color="slate" />
                        </div>
                    </div>

                    <div className="card-premium p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-xl shadow-emerald-900/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">Protocol Note</p>
                        <p className="text-sm font-medium leading-relaxed">Ensure all maintenance requests are submitted 48 hours prior to commencement for optimal network stability.</p>
                    </div>
                </div>

                {/* Leaves Table */}
                <div className="lg:col-span-3 card-premium p-0 border-none shadow-premium overflow-hidden bg-white">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold">Request History</h3>
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stakeholder</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type & Duration</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    {isAdmin && <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400">Synchronizing records...</td>
                                    </tr>
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400">No maintenance cycles recorded in the current epoch.</td>
                                    </tr>
                                ) : leaves.map((leave: any) => (
                                    <tr key={leave.id} className="group hover:bg-emerald-50/30 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all">
                                                    {leave.profiles?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{leave.profiles?.full_name || 'System Member'}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">{leave.profiles?.employee_code || 'ID-REDACTED'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    leave.leave_type === 'sick' ? 'bg-amber-400' : 'bg-emerald-400'
                                                )} />
                                                {(leave.leave_type || 'unspecified').charAt(0).toUpperCase() + (leave.leave_type || 'unspecified').slice(1)}
                                            </p>
                                            <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                                                {leave.start_date} → {leave.end_date}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border inline-flex items-center gap-2",
                                                getStatusColor(leave.status)
                                            )}>
                                                {leave.status === 'approved' && <CheckCircle2 size={12} />}
                                                {leave.status === 'rejected' && <XCircle size={12} />}
                                                {leave.status === 'pending' && <Clock size={12} />}
                                                {leave.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-8 py-5 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleAction(leave.id, 'approved')}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                                            title="Authorize"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(leave.id, 'rejected')}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                                            title="Terminate"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <LeaveRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
        </div>
    );
};

const QuotaProgress = ({ label, used, total, color }: { label: string; used: number; total: number; color: 'emerald' | 'amber' | 'slate' }) => {
    const percentage = Math.min(100, (used / total) * 100);
    const colorClasses = {
        emerald: 'bg-emerald-500 shadow-emerald-500/20',
        amber: 'bg-amber-500 shadow-amber-500/20',
        slate: 'bg-slate-500 shadow-slate-500/20'
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</span>
                <span className="text-sm font-bold text-slate-700">{used} / {total} <span className="text-slate-300 text-xs font-medium">Days</span></span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
