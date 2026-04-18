import React, { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    MoreVertical,
    Settings,
    Plus
} from 'lucide-react';
import { useListLeaves, useLeaveMutations, useLeaveConfigurations } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { LeaveRequestModal } from '../components/LeaveRequestModal';
import { LeaveSettingsModal } from '../components/LeaveSettingsModal';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

interface LeaveManagementViewProps {
    isAdmin: boolean;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ isAdmin }) => {
    const { session } = useAuthStore();
    const { toast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // If admin, we don't pass employee_id to see all, but the API might need company_id
    const params = isAdmin ? { company_id: session?.user?.company_id } : {};
    const { data: leaves = [], isLoading } = useListLeaves(params);
    const { data: configs = [] } = useLeaveConfigurations();
    const { review } = useLeaveMutations();


    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await review.mutateAsync({ id, payload: { status } });
            toast({
                title: status === 'approved' ? 'Approved' : 'Rejected',
                description: `The leave request has been ${status}.`,
                type: status === 'approved' ? 'success' : 'error'
            });
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
                {isAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="gap-2 px-5 py-2.5 text-xs font-bold"
                    >
                        <Settings size={18} />
                        Policy Settings
                    </Button>
                )}
                {!isAdmin && (
                    <Button
                        onClick={() => setIsRequestModalOpen(true)}
                    >
                        <Plus size={18} />
                        Request Leave
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {isAdmin ? (
                        <div className="card-premium p-6 bg-surface border border-border shadow-none">
                            <h4 className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-6">Company Overview</h4>
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-warning/5 border border-warning/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-warning/80 mb-1">Pending Approval</p>
                                    <p className="text-2xl font-bold text-textPrimary tracking-tight">
                                        {leaves.filter((l: any) => l.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-success/80 mb-1">Total Approved</p>
                                    <p className="text-2xl font-bold text-textPrimary tracking-tight">
                                        {leaves.filter((l: any) => l.status === 'approved').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-premium p-6 bg-surface border border-border shadow-none">
                            <h4 className="text-sm font-medium text-textSecondary uppercase tracking-widest mb-6">Leave Balance</h4>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <>
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </>
                                ) : configs.length > 0 ? (
                                    configs.map((c: any) => (
                                        <QuotaProgress 
                                            key={c.id} 
                                            label={c.leave_type} 
                                            used={0} 
                                            total={c.annual_allowance} 
                                            color={c.leave_type === 'sick' ? 'warning' : 'primary'} 
                                        />
                                    ))
                                ) : (
                                    <>
                                        <QuotaProgress label="Paid" used={12} total={24} color="primary" />
                                        <QuotaProgress label="Sick" used={3} total={10} color="warning" />
                                        <QuotaProgress label="Unpaid" used={2} total={5} color="textSecondary" />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        "card-premium p-6 border shadow-none",
                        isAdmin ? "bg-bg border-soft" : "bg-primary/10 border-primary/10"
                    )}>
                        <p className={cn(
                            "text-sm font-medium uppercase tracking-widest mb-2",
                            isAdmin ? "text-textSecondary" : "text-primary"
                        )}>{isAdmin ? 'Admin Help' : 'Note'}</p>
                        <p className="text-sm font-medium leading-relaxed text-textSecondary">
                            {isAdmin 
                                ? 'Review pending requests from the table. Rejected requests can be re-evaluated later.' 
                                : 'Please send leave requests 48 hours in advance for quick approval.'}
                        </p>
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
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-10 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                            {isAdmin && <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>}
                                        </tr>
                                    ))
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-sm text-textSecondary">No leave requests found.</td>
                                    </tr>
                                ) : leaves.map((leave: any) => (
                                    <tr key={leave.id} className="group hover:bg-background transition-all">
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-background flex items-center justify-center font-medium text-textSecondary text-sm border border-border transition-all">
                                                    {leave.employees?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-textPrimary">{leave.employees?.full_name || 'Member'}</p>
                                                    <p className="text-sm text-textSecondary font-medium uppercase">{leave.employees?.employee_code || 'ID-REDACTED'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-textPrimary flex items-center gap-2">
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    (leave.leave_type || leave.type) === 'sick' ? 'bg-warning' : 'bg-primary'
                                                )} />
                                                {(leave.leave_type || leave.type || 'unspecified').charAt(0).toUpperCase() + (leave.leave_type || leave.type || 'unspecified').slice(1)}
                                            </p>
                                            <p className="text-sm text-textSecondary font-medium uppercase mt-1">
                                                {leave.dates?.start || leave.start_date} → {leave.dates?.end || leave.end_date}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            loading={review.isPending && review.variables?.id === leave.id && review.variables?.payload?.status === 'approved'}
                                                            onClick={() => handleAction(leave.id, 'approved')}
                                                            className="h-8 w-8 text-primary hover:bg-primary/10"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            loading={review.isPending && review.variables?.id === leave.id && review.variables?.payload?.status === 'rejected'}
                                                            onClick={() => handleAction(leave.id, 'rejected')}
                                                            className="h-8 w-8 text-error hover:bg-error/10"
                                                        >
                                                            <XCircle size={16} />
                                                        </Button>
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
            <LeaveSettingsModal isOpen={isSettingsModalOpen} onClose={() => {
                setIsSettingsModalOpen(false);
            }} />
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
