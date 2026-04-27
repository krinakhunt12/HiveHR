import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    ArrowRight,
    Filter,
    Search,
    CalendarRange,
    Wind,
    History,
    Settings,
    Plus,
    Clock
} from 'lucide-react';
import {Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { SkeletonCard, SkeletonTable, SkeletonPageHeader } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/utils/cn';
import { useListLeaves, useLeaveMutations, useLeaveBalance } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { useAuthStore } from '@/shared/auth/store';
import { detectRole } from '@/shared/utils/authUtils';
import { LeaveRequestModal } from '../components/LeaveRequestModal';
import { LeaveSettingsModal } from '../components/LeaveSettingsModal';

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

    if (isLoading) {
        return (
            <div className="p-6 md:p-8 space-y-10">
                <SkeletonPageHeader />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SkeletonCard hasHeader={false} className="h-44" />
                    <SkeletonCard hasHeader={false} className="h-44" />
                    <SkeletonCard hasHeader={false} className="h-44" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <SkeletonTable rows={6} columns={4} />
                    </div>
                    <div className="space-y-8">
                        <SkeletonCard className="h-[450px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12">
                <ErrorState
                    error={error as Error}
                    onRetry={() => refetch()}
                    title="Leave System Offline"
                    description="We're having trouble retrieving attendance records."
                />
            </div>
        );
    }

    const pendingRequests = leaves.filter((r: any) => r.status === 'pending');
    const historyRequests = leaves.filter((r: any) => r.status !== 'pending');

    return (
        <div className="p-6 md:p-8 space-y-10 animate-in fade-in duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-textPrimary">Attendance & Leave</h1>
                    <p className="text-sm font-medium text-textSecondary mt-1.5">
                        {isAdmin ? 'Administrative control over enterprise leave logistics.' : 'Manage your personal attendance and leave allocations.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="h-11 px-6 rounded-xl font-semibold gap-2 border-border hover:bg-surface transition-all"
                        >
                            <Settings size={18} /> Governance
                        </Button>
                    )}
                    {!isAdmin && (
                        <Button
                            size="lg"
                            onClick={() => setIsRequestModalOpen(true)}
                            className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus size={18} /> Initiate Request
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Quotas Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isPrivileged ? (
                    <Card className="col-span-full border-dashed border-primary/20 bg-primary/[0.02] rounded-3xl overflow-hidden">
                        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldAlert size={32} />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-xl font-bold text-textPrimary">{isSuperAdmin ? 'Platform Administrator' : 'Company Executive'}</h3>
                                <p className="text-sm font-medium text-textSecondary mt-2">
                                    {isSuperAdmin
                                        ? 'Global visibility enabled. Leave quotas are scoped to individual personnel profiles.'
                                        : 'Administrative mode active. Personal quotas are suppressed in favor of team management views.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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
                    <div className="col-span-full">
                        <EmptyState 
                            title="No Quotas Assigned" 
                            description="Your current employment profile does not have any leave allocations." 
                            icon={CalendarRange}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* History Table */}
                <div className="lg:col-span-2">
                    <Card className="rounded-3xl overflow-hidden border-border/40 shadow-sm">
                        <CardHeader className="py-6 px-8 border-b border-border/40 bg-surface/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-textPrimary flex items-center gap-3">
                                <History size={20} className="text-primary" /> Allocation Registry
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><Search size={16} /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><Filter size={16} /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {historyRequests.length === 0 ? (
                                <EmptyState
                                    title="Registry Empty"
                                    description="Processed leave records will appear here."
                                    icon={Clock}
                                    className="border-none shadow-none py-24"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-surface/30 border-b border-border/20">
                                                <th className="px-8 py-5 text-xs font-bold text-textSecondary uppercase tracking-widest">Employee / Type</th>
                                                <th className="px-8 py-5 text-xs font-bold text-textSecondary uppercase tracking-widest">Duration</th>
                                                <th className="px-8 py-5 text-xs font-bold text-textSecondary uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-xs font-bold text-textSecondary uppercase tracking-widest text-right">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/20">
                                            {historyRequests.map((req: any) => (
                                                <tr key={req.id} className="hover:bg-surface/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{req.employees?.full_name || 'Staff Member'}</p>
                                                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1.5">{req.leave_type}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                                                            <span>{req.start_date}</span>
                                                            <ArrowRight size={14} className="text-textSecondary" />
                                                            <span>{req.end_date}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1.5">Standard Cycle</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Badge 
                                                            variant={req.status === 'approved' ? 'default' : 'destructive'}
                                                            className={cn(
                                                                "px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]",
                                                                req.status === 'approved' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                                                            )}
                                                        >
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className="text-xs font-bold text-textSecondary italic">{req.admin_comment || 'Internal'}</p>
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

                {/* Pending Section */}
                <div className="space-y-8">
                    <Card className="rounded-3xl overflow-hidden border-border/40 shadow-sm">
                        <CardHeader className="py-6 px-8 border-b border-border/40 bg-surface/50">
                            <CardTitle className="text-xs font-bold text-textSecondary uppercase tracking-widest">Pending Validation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingRequests.length === 0 ? (
                                <EmptyState
                                    title="Queue Empty"
                                    description="No requests require immediate review."
                                    icon={CheckCircle2}
                                    className="border-none shadow-none py-20"
                                />
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {pendingRequests.map((req: any) => (
                                        <div key={req.id} className="p-8 hover:bg-surface/30 transition-all group">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10 text-lg shadow-inner">
                                                    {req.employees?.full_name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{req.employees?.full_name || 'Staff Member'}</p>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-textSecondary mt-1">{req.leave_type}</p>
                                                </div>
                                            </div>

                                            <div className="bg-surface p-5 rounded-2xl border border-border/40 mb-6 space-y-3 shadow-sm">
                                                <div className="flex items-center gap-3 text-textPrimary">
                                                    <Calendar size={16} className="text-primary" />
                                                    <span className="text-xs font-bold">{req.start_date} – {req.end_date}</span>
                                                </div>
                                                <p className="text-xs font-medium text-textSecondary leading-relaxed italic">"{req.reason || 'No specific rationale provided.'}"</p>
                                            </div>

                                            {isAdmin && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        variant="ghost"
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'rejected')}
                                                        className="h-11 rounded-xl font-bold text-error hover:bg-error/5 hover:text-error transition-all"
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'approved')}
                                                        className="h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl bg-slate-900 p-8 text-white border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Wind size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/10 w-fit rounded-2xl"><Wind size={24} /></div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold tracking-tight">Policy Insights</h4>
                                <p className="text-sm font-medium text-white/60 leading-relaxed">Enterprise attendance parameters are optimized for operational stability. Review the Q3 Handbook.</p>
                            </div>
                            <Button className="w-full h-12 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 border-none">
                                Download Registry PDF
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <LeaveRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
            <LeaveSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

const QuotaProgress = ({ label, current, total, color }: { label: string, current: number, total: number, color: 'primary' | 'accent' }) => {
    const percentage = Math.min((current / total) * 100, 100);
    const isAccent = color === 'accent';

    return (
        <Card className="rounded-3xl p-8 bg-white border-border/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="space-y-2">
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">{label}</p>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-3xl font-bold text-textPrimary tracking-tight">{current}</p>
                        <p className="text-sm font-bold text-textSecondary">/ {total} Days</p>
                    </div>
                </div>
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-500",
                    isAccent ? "bg-accent/5 text-accent border-accent/10" : "bg-primary/5 text-primary border-primary/10"
                )}>
                    <CalendarRange size={24} />
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-1000 rounded-full",
                            isAccent ? "bg-accent shadow-[0_0_15px_rgba(217,119,6,0.3)]" : "bg-primary shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs font-bold text-textSecondary tracking-wide">
                    <span>Utilization Index</span>
                    <span className={cn(isAccent ? "text-accent" : "text-primary")}>{Math.round(percentage)}%</span>
                </div>
            </div>
        </Card>
    );
};

function ShieldAlert({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}