import React, { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    MoreVertical,
    Plus
} from 'lucide-react';
import { useListLeaves, useLeaveMutations } from '@/shared/api/hooks/hrHooks';
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
                title: status === 'approved' ? 'Approved' : 'Rejected',
                description: `The leave request has been ${status}.`,
                type: status === 'approved' ? 'success' : 'error'
            });
            refetch();
        } catch (err: any) {
            toast({ title: 'Update Failed', description: err.message || 'Could not update request', type: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-success/10 text-success border-success/20';
            case 'rejected': return 'bg-error/10 text-error border-error/20';
            default: return 'bg-warning/10 text-warning border-warning/20';
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-xl font-medium text-textPrimary tracking-tight font-sans">Leaves</h1>
                    <p className="text-sm font-medium text-textSecondary mt-0.5">
                        {isAdmin ? 'Manage leave requests for your employees.' : 'View and request leaves.'}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        Request Leave
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-premium p-6 bg-surface border border-border shadow-none">
                        <h4 className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-6">Leave Balance</h4>
                        <div className="space-y-4">
                            <QuotaProgress label="Paid" used={12} total={24} color="primary" />
                            <QuotaProgress label="Sick" used={3} total={10} color="warning" />
                            <QuotaProgress label="Unpaid" used={2} total={5} color="textSecondary" />
                        </div>
                    </div>

                    <div className="card-premium p-6 bg-primary/10 border border-primary/10 shadow-none">
                        <p className="text-sm font-medium uppercase tracking-widest text-primary mb-2">Note</p>
                        <p className="text-sm font-medium leading-relaxed text-textSecondary">Please send leave requests 48 hours in advance for quick approval.</p>
                    </div>
                </div>

                {/* Leaves Table */}
                <div className="lg:col-span-3 card-premium p-0 border border-border shadow-none overflow-hidden bg-surface">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/50">
                        <h3 className="text-base font-medium text-textPrimary">Requests</h3>
                        <button className="p-2 hover:bg-surface rounded-md transition-colors text-textSecondary border border-transparent hover:border-border">
                            <Filter size={16} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-background/50">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest">Status</th>
                                    {isAdmin && <th className="px-6 py-3 text-sm font-medium text-textSecondary uppercase tracking-widest text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-textSecondary">Loading records...</td>
                                    </tr>
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-textSecondary">No leave requests found.</td>
                                    </tr>
                                ) : leaves.map((leave: any) => (
                                    <tr key={leave.id} className="group hover:bg-background transition-all">
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-background flex items-center justify-center font-medium text-textSecondary text-sm border border-border transition-all">
                                                    {leave.profiles?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{leave.profiles?.full_name || 'Member'}</p>
                                                    <p className="text-sm text-textSecondary font-medium uppercase">{leave.profiles?.employee_code || 'ID-REDACTED'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-textPrimary flex items-center gap-2">
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    leave.leave_type === 'sick' ? 'bg-warning' : 'bg-primary'
                                                )} />
                                                {(leave.leave_type || 'unspecified').charAt(0).toUpperCase() + (leave.leave_type || 'unspecified').slice(1)}
                                            </p>
                                            <p className="text-sm text-textSecondary font-medium uppercase mt-1">
                                                {leave.start_date} → {leave.end_date}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-sm font-medium uppercase tracking-widest border inline-flex items-center gap-2",
                                                getStatusColor(leave.status)
                                            )}>
                                                {leave.status === 'approved' && <CheckCircle2 size={12} />}
                                                {leave.status === 'rejected' && <XCircle size={12} />}
                                                {leave.status === 'pending' && <Clock size={12} />}
                                                {leave.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleAction(leave.id, 'approved')}
                                                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-all border border-transparent hover:border-primary/20"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(leave.id, 'rejected')}
                                                            className="p-1.5 text-error hover:bg-error/10 rounded-md transition-all border border-transparent hover:border-error/20"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="p-2 text-textSecondary hover:text-textPrimary transition-colors">
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

const QuotaProgress = ({ label, used, total, color }: { label: string; used: number; total: number; color: 'primary' | 'warning' | 'textSecondary' }) => {
    const percentage = Math.min(100, (used / total) * 100);
    const colorClasses = {
        primary: 'bg-primary shadow-none',
        warning: 'bg-warning shadow-none',
        textSecondary: 'bg-textSecondary shadow-none'
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-textSecondary uppercase tracking-tight">{label}</span>
                <span className="text-sm font-medium text-textPrimary">{used} / {total} <span className="text-textSecondary text-sm font-medium">Days</span></span>
            </div>
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", colorClasses[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
