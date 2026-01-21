import React, { useState } from 'react';
import {
    Inbox,
    CheckCircle2,
    XCircle,
    Search,
    Calendar,
    Filter,
    MessageSquare,
    Command,
    ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAllLeaves, useApproveLeave, useRejectLeave } from '../../hooks/api/useLeaveQueries';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

const HRLeaveManagement = () => {
    const { data: leavesData, isLoading } = useAllLeaves();
    const leaves = leavesData?.data?.leaves || [];
    const approveMutation = useApproveLeave();
    const rejectMutation = useRejectLeave();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleAction = async (id, status) => {
        try {
            if (status === 'approved') {
                await approveMutation.mutateAsync(id);
            } else if (status === 'rejected') {
                await rejectMutation.mutateAsync({ id, reason: 'Administratively Rejected' });
            }
            showToast(`Leave status protocol: ${status.toUpperCase()}_LOGGED`, 'success');
        } catch (err) {
            showToast(`Protocol failure: ACTION_DENIED`, 'error');
        }
    };

    const filteredLeaves = leaves?.filter(l => {
        const userName = l.user?.full_name || l.user_name || '';
        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in text-foreground">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase underline decoration-4 underline-offset-8">Leave_Protocols</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">Global control unit for personnel absence logging.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-secondary px-4 py-2 border rounded-sm">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Queue_Depth</p>
                            <p className="text-xl font-bold tracking-tighter leading-none">{leaves?.filter(l => l.status === 'pending').length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Command Bar */}
                <Card className="rounded-none border-foreground/10 bg-secondary/20 shadow-none">
                    <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Command className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="EXECUTE_NAME_SEARCH..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 rounded-none border-foreground/10 bg-background font-black uppercase tracking-[0.15em] text-[10px] focus-visible:ring-0 focus-visible:border-foreground"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? "default" : "outline"}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "h-12 px-6 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border-foreground/10",
                                        filterStatus === status ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:bg-foreground hover:text-background"
                                    )}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Card key={i} className="rounded-none border-foreground/10 shadow-none p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-sm" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-2 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-20 w-full" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            </Card>
                        ))
                    ) : filteredLeaves.length === 0 ? (
                        <div className="col-span-full py-24 text-center border border-dashed border-foreground/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">NO_ACTIVE_RECORDS_IN_SELECTED_PROTOCOL</p>
                        </div>
                    ) : filteredLeaves.map((leave) => {
                        const userName = leave.user?.full_name || leave.user_name || 'UNKNOWN_UNIT';
                        const empId = leave.user?.employee_id || leave.emp_id || 'N/A';

                        return (
                            <Card key={leave.id} className="rounded-none border-foreground/10 shadow-none hover:border-foreground/30 transition-all p-8 flex flex-col h-full bg-background group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                    HIVEHR_RECORD_SYSTEM
                                </div>

                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-none bg-foreground text-background flex items-center justify-center font-black text-lg">
                                            {userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tighter leading-none">{userName}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">ID: {empId}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 text-[9px] font-black uppercase tracking-widest border",
                                        leave.status === 'pending' ? 'bg-secondary border-foreground/20' :
                                            leave.status === 'approved' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground grayscale'
                                    )}>
                                        {leave.status}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 mb-8">
                                    <div className="p-5 bg-secondary/40 border border-foreground/5 space-y-3">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-foreground/5 pb-2">Temporal_Data</p>
                                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{leave.start_date} <ArrowRight className="inline w-3 h-3 mx-1" /> {leave.duration}D</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">CAT: {leave.type}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Personnel_Reasoning</p>
                                        <div className="text-[11px] font-bold leading-relaxed bg-secondary/20 p-5 border border-foreground/5">
                                            "{leave.reason || 'NO_REASON_PROVIDED_BY_SOURCE'}"
                                        </div>
                                    </div>
                                </div>

                                {leave.status === 'pending' && (
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <Button
                                            variant="outline"
                                            disabled={approveMutation.isLoading || rejectMutation.isLoading}
                                            onClick={() => handleAction(leave.id, 'rejected')}
                                            className="h-12 bg-transparent text-foreground border-foreground/10 rounded-none font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-2" />
                                            Deny
                                        </Button>
                                        <Button
                                            disabled={approveMutation.isLoading || rejectMutation.isLoading}
                                            onClick={() => handleAction(leave.id, 'approved')}
                                            className="h-12 bg-foreground text-background rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                )}

                                {leave.status !== 'pending' && (
                                    <div className="flex items-center justify-center h-12 bg-secondary border border-foreground/10 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        LEDGER_FINALIZED
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRLeaveManagement;
