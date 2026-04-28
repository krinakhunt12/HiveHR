import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Filter,
    Search,
    CalendarRange,
    Wind,
    History,
    Settings,
    Plus
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton, SkeletonButton, SkeletonCard, SkeletonTable } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useListLeaves, useLeaveMutations, useLeaveBalance } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { useAuthStore } from '@/shared/auth/store';
import { detectRole } from '@/shared/utils/authUtils';
import { LeaveRequestModal } from '../components/LeaveRequestModal';
import { LeaveSettingsModal } from '../components/LeaveSettingsModal';
import { Info } from 'lucide-react';

interface LeaveManagementViewProps {
    isAdmin?: boolean;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ isAdmin = false }) => {
    const { toast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const { session } = useAuthStore();
    const role = detectRole(session?.user);
    const isSuperAdmin = role === 'admin';
    const isCompanyAdmin = role === 'company_admin';
    const isPrivileged = isSuperAdmin || isCompanyAdmin;

    const {
        data: leaves = [],
        isLoading,
        error,
        refetch
    } = useListLeaves({}, { enabled: !isSuperAdmin });

    const { data: balances = [] } = useLeaveBalance({ enabled: !isPrivileged });
    const { review } = useLeaveMutations();

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await review.mutateAsync({ id, payload: { status } });
            toast({
                title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
                description: `Leave status has been updated to ${status}.`,
                type: status === 'approved' ? 'success' : 'error'
            });
        } catch (err: any) {
            toast({
                title: 'Review Failed',
                description: err.message || 'Could not update request status.',
                type: 'error'
            });
        }
    };

    if (error) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <ErrorState
                    error={error as Error}
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-10 text-left">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded-xl" />
                        <Skeleton className="h-4 w-96 rounded-md" />
                    </div>
                    <div className="flex gap-3">
                        <SkeletonButton className="h-11 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SkeletonCard hasHeader={false} lines={2} className="h-40" />
                    <SkeletonCard hasHeader={false} lines={2} className="h-40" />
                    <SkeletonCard hasHeader={false} lines={2} className="h-40" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <SkeletonTable rows={6} columns={4} />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-[400px] rounded-[2rem]" />
                        <Skeleton className="h-48 rounded-[2rem]" />
                    </div>
                </div>
            </div>
        );
    }

    const pendingRequests = leaves.filter((r: any) => r.status === 'pending');
    const historyRequests = leaves.filter((r: any) => r.status !== 'pending');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Time Off</h1>
                    <p className="text-sm font-medium text-textSecondary mt-1.5">
                        {isAdmin ? 'Manage leave requests for the whole team.' : 'Keep track of your time off and requests.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="gap-2 px-4 text-xs font-semibold border-primary/10 hover:bg-primary/5"
                        >
                            <Settings size={18} /> Leave Rules
                        </Button>
                    )}
                    {!isAdmin && (
                        <Button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="gap-2 px-6 h-11 text-xs font-medium"
                        >
                            <Plus size={18} /> Request Time Off
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isPrivileged ? (
                    <div className="col-span-full py-10 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-center px-6">
                        <Info className="text-primary mb-4" size={32} />
                        <h3 className="text-lg font-bold text-textPrimary">{isSuperAdmin ? 'Admin View' : 'Admin View'}</h3>
                        <p className="text-sm text-textSecondary mt-2 max-w-md">
                            {isSuperAdmin
                                ? 'As a Super Admin, you are viewing the global dashboard. Leave limits are set for each employee.'
                                : 'As an Admin, you can manage and review team requests below.'}
                        </p>
                    </div>
                ) : balances.length > 0 ? (
                    balances.map((b: any) => (
                        <QuotaProgress
                            key={b.id}
                            label={b.leave_types?.name || 'Leave'}
                            current={Number(b.taken) + Number(b.pending)}
                            total={Number(b.quota) + Number(b.carry_forward)}
                            color={b.leave_types?.name?.toLowerCase() === 'sick' ? 'accent' : 'primary'}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-10 bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                        <p className="text-sm font-semibold text-textSecondary">No leave quotas assigned to your current policy.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="card-premium overflow-hidden bg-white">
                        <CardHeader className="py-6 px-8 border-b border-primary/5 bg-primary/[0.01] flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                <History size={18} className="text-primary" /> Past Requests
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-primary/10"><Filter size={14} /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-primary/10"><Search size={14} /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[300px]">
                            {historyRequests.length === 0 ? (
                                <EmptyState
                                    title="No history yet"
                                    description="Processed leave records will show up here."
                                    icon={History}
                                    className="py-20"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-primary/[0.01]">
                                            <tr>
                                                <th className="px-8 py-4 text-xs font-bold text-textSecondary uppercase tracking-[0.2em]">Employee</th>
                                                <th className="px-8 py-4 text-xs font-bold text-textSecondary uppercase tracking-[0.2em]">Dates</th>
                                                <th className="px-8 py-4 text-xs font-bold text-textSecondary uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-8 py-4 text-xs font-bold text-textSecondary uppercase tracking-[0.2em] text-right">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {historyRequests.map((req: any) => (
                                                <tr key={req.id} className="hover:bg-primary/[0.01] transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{req.employees?.full_name || 'Individual'}</p>
                                                        <p className="text-xs text-textSecondary font-medium  mt-1">{req.leave_type}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold text-textPrimary">{req.start_date} <ArrowRight size={12} className="inline mx-1 " /> {req.end_date}</p>
                                                        <p className="text-xs text-textSecondary font-medium  mt-1">Regular Leave</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-[0.15em] border shadow-sm",
                                                            req.status === 'approved' ? 'bg-success/5 text-success border-success/10' : 'bg-error/5 text-error border-error/10'
                                                        )}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <p className="text-xs font-bold text-textSecondary italic">{req.admin_comment || 'No notes'}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="card-premium bg-white overflow-hidden border-primary/10">
                        <CardHeader className="py-6 px-8 border-b border-primary/5 bg-primary/[0.01]">
                            <CardTitle className="text-sm font-semibold text-textSecondary uppercase">Waiting for Approval</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[300px]">
                            {pendingRequests.length === 0 ? (
                                <EmptyState
                                    title="Nothing to do"
                                    description="No pending leave requests require review."
                                    icon={CheckCircle2}
                                    className="py-16"
                                />
                            ) : (
                                <div className="divide-y divide-primary/5">
                                    {pendingRequests.map((req: any) => (
                                        <div key={req.id} className="p-8 hover:bg-primary/[0.02] transition-all group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10">
                                                        {req.employees?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{req.employees?.full_name || 'Anonymous'}</p>
                                                        <p className="text-xs font-bold  text-textSecondary mt-1">{req.leave_type}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-primary/[0.02] p-4 rounded-xl border border-primary/5 mb-6">
                                                <div className="flex items-center gap-3 text-textPrimary mb-3">
                                                    <Calendar size={14} className="text-primary" />
                                                    <span className="text-xs font-bold">{req.start_date} – {req.end_date}</span>
                                                </div>
                                                <p className="text-xs text-textSecondary font-semibold leading-relaxed">{req.reason || 'No reason given.'}</p>
                                            </div>

                                            {isAdmin && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="outline"
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'rejected')}
                                                        className="h-10 text-xs font-bold  border-error/20 text-error hover:bg-error/10"
                                                    >
                                                        <XCircle size={14} className="mr-2" /> Decline
                                                    </Button>
                                                    <Button
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'approved')}
                                                        className="h-10 text-xs font-bold "
                                                    >
                                                        <CheckCircle2 size={14} className="mr-2" /> Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="card-premium bg-gradient-to-br from-primary to-primaryDark p-8 text-white border-none ">
                        <div className="p-3 bg-white/10 w-fit rounded-xl mb-6"><Wind size={24} /></div>
                        <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">Built for all teams.</h2>
                        <p className="text-white/70 text-lg max-w-2xl">From startups to enterprises, HiveHr grows with you.</p>
                    </Card>
                </div>
            </div>

            <LeaveRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
            <LeaveSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

const QuotaProgress = ({ label, current, total, color }: { label: string, current: number, total: number, color: 'primary' | 'accent' }) => {
    const percentage = (current / total) * 100;
    const isAccent = color === 'accent';

    return (
        <Card className="card-premium p-8 bg-white text-left group">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-xs font-bold text-textSecondary mb-2">{label}</p>
                    <p className="text-2xl font-bold text-textPrimary">{current}/{total} <span className="text-xs font-bold text-textSecondary ml-1">Days</span></p>
                </div>
                <div className={cn(
                    "p-3 rounded-xl border group-hover:scale-110 transition-transform",
                    isAccent ? "bg-accent/5 text-accent border-accent/10" : "bg-primary/5 text-primary border-primary/10"
                )}>
                    <CalendarRange size={20} />
                </div>
            </div>

            <div className="space-y-3">
                <div className="h-2 bg-primary/5 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-1000",
                            isAccent ? "bg-accent shadow-[0_0_12px_rgba(217,119,6,0.4)]" : "bg-primary shadow-[0_0_12px_rgba(5,150,105,0.4)]"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs font-bold text-textSecondary">
                    <span>Utilization</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            </div>
        </Card>
    );
};
