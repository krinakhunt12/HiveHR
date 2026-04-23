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
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { cn } from '@/shared/utils/cn';
import { useListLeaves, useLeaveMutations, useLeaveConfigurations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { LeaveRequestModal } from '../components/LeaveRequestModal';
import { LeaveSettingsModal } from '../components/LeaveSettingsModal';

interface LeaveManagementViewProps {
    isAdmin?: boolean;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ isAdmin = false }) => {
    const { toast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const { 
        data: leaves = [], 
        isLoading, 
        error,
        refetch 
    } = useListLeaves();

    const { data: configs = [] } = useLeaveConfigurations();
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
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <Skeleton className="h-[400px] rounded-[2rem]" />
            </div>
        );
    }

    const pendingRequests = leaves.filter((r: any) => r.status === 'pending');
    const historyRequests = leaves.filter((r: any) => r.status !== 'pending');

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-textPrimary font-display">Time-Off Registry</h1>
                    <p className="text-sm font-semibold text-textSecondary mt-1.5 opacity-60">
                        {isAdmin ? 'Administrative control over enterprise leave logistics.' : 'Manage your personal attendance and leave allocations.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="gap-2 px-6 h-11 text-xs font-bold uppercase tracking-widest border-primary/10 hover:bg-primary/5"
                        >
                            <Settings size={18} /> Governance Policies
                        </Button>
                    )}
                    {!isAdmin && (
                        <Button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="gap-2 px-6 h-11 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            <Plus size={18} /> Initiate Request
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {configs.length > 0 ? (
                    configs.slice(0, 3).map((c: any) => (
                        <QuotaProgress 
                            key={c.id} 
                            label={c.leave_type} 
                            current={0} 
                            total={c.annual_allowance} 
                            color={c.leave_type === 'sick' ? 'accent' : 'primary'} 
                        />
                    ))
                ) : (
                    <>
                        <QuotaProgress label="Annual Leave" current={18} total={24} color="primary" />
                        <QuotaProgress label="Sick Leave" current={4} total={10} color="accent" />
                        <QuotaProgress label="Personal" current={2} total={5} color="primary" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="card-premium overflow-hidden bg-white">
                        <CardHeader className="py-6 px-8 border-b border-primary/5 bg-primary/[0.01] flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                                <History size={18} className="text-primary" /> Allocation History
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-primary/10"><Filter size={14} /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-primary/10"><Search size={14} /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[300px]">
                            {historyRequests.length === 0 ? (
                                <EmptyState 
                                    title="Registry Empty" 
                                    description="Historical leave records will appear here once processed." 
                                    icon={History}
                                    className="py-20"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-primary/[0.01]">
                                            <tr>
                                                <th className="px-8 py-4 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Resource</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Duration</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] text-right">Review</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {historyRequests.map((req: any) => (
                                                <tr key={req.id} className="hover:bg-primary/[0.01] transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">{req.employees?.full_name || 'Individual'}</p>
                                                        <p className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1 opacity-50">{req.leave_type}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold text-textPrimary">{req.start_date} <ArrowRight size={12} className="inline mx-1 opacity-30" /> {req.end_date}</p>
                                                        <p className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1 opacity-50">Standard Cycle</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
                                                            req.status === 'approved' ? 'bg-success/5 text-success border-success/10' : 'bg-error/5 text-error border-error/10'
                                                        )}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <p className="text-xs font-bold text-textSecondary opacity-60 italic">{req.admin_comment || 'No notes'}</p>
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
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-textSecondary opacity-60">Pending Validation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[300px]">
                            {pendingRequests.length === 0 ? (
                                <EmptyState 
                                    title="All Clear" 
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
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-textSecondary opacity-50 mt-1">{req.leave_type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-primary/[0.02] p-4 rounded-xl border border-primary/5 mb-6">
                                                <div className="flex items-center gap-3 text-textPrimary mb-3">
                                                    <Calendar size={14} className="text-primary opacity-60" />
                                                    <span className="text-xs font-bold">{req.start_date} – {req.end_date}</span>
                                                </div>
                                                <p className="text-xs text-textSecondary font-semibold leading-relaxed opacity-80">{req.reason || 'No specific rationale provided.'}</p>
                                            </div>

                                            {isAdmin && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button 
                                                        variant="outline" 
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'rejected')}
                                                        className="h-10 text-[10px] font-black uppercase tracking-widest border-error/20 text-error hover:bg-error/10"
                                                    >
                                                        <XCircle size={14} className="mr-2" /> Decline
                                                    </Button>
                                                    <Button 
                                                        disabled={review.isPending}
                                                        onClick={() => handleAction(req.id, 'approved')}
                                                        className="h-10 text-[10px] font-black uppercase tracking-widest"
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

                    <Card className="card-premium bg-gradient-to-br from-primary to-primaryDark p-8 text-white border-none shadow-xl shadow-primary/20">
                        <div className="p-3 bg-white/10 w-fit rounded-xl mb-6"><Wind size={24} /></div>
                        <h4 className="text-xl font-bold tracking-tight mb-2">Policy Overview</h4>
                        <p className="text-xs font-medium text-white/70 leading-relaxed mb-6">Global leave parameters are optimized for enterprise stability. Review the updated handbook for Q3 guidelines.</p>
                        <Button variant="outline" className="w-full h-11 text-[10px] font-black uppercase tracking-widest text-white border-white/20 hover:bg-white/10">
                            Download Handbook
                        </Button>
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
                    <p className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em] opacity-40 mb-2">{label}</p>
                    <p className="text-2xl font-bold text-textPrimary font-display tracking-tight">{current}/{total} <span className="text-xs font-bold text-textSecondary opacity-40 ml-1">Days</span></p>
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
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-textSecondary opacity-40">
                    <span>Utilization</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            </div>
        </Card>
    );
};
