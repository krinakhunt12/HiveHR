import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    Plus,
    MoreVertical,
    Target,
    Search,
    Filter,
    ClipboardCheck
} from 'lucide-react';
import { useListTasks, useTaskMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { SkeletonPageHeader, SkeletonCard } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';

interface TaskManagementViewProps {
    isAdmin: boolean;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ isAdmin }) => {
    const { toast } = useToast();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: rawTasks = [], isLoading, error, refetch } = useListTasks({}, isAdmin);
    const { update } = useTaskMutations(isAdmin);

    const tasks = Array.isArray(rawTasks) ? rawTasks : [];

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await update.mutateAsync({ id, payload: { status: newStatus as any } });
            toast({
                title: 'Telemetry Updated',
                description: 'The operational task status has been synchronized.',
                type: 'success'
            });
        } catch (err: any) {
            toast({ title: 'Sync Failed', description: err.message || 'Could not update task state', type: 'error' });
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'critical': return { color: 'bg-error', label: 'CRITICAL' };
            case 'high': return { color: 'bg-warning', label: 'HIGH' };
            case 'medium': return { color: 'bg-primary', label: 'MEDIUM' };
            default: return { color: 'bg-textSecondary', label: 'LOW' };
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'SYNCHRONIZED', className: 'bg-success/10 text-success border-success/20' };
            case 'in_progress': return { label: 'PROCESSING', className: 'bg-warning/10 text-warning border-warning/20' };
            case 'blocked': return { label: 'TERMINATED', className: 'bg-error/10 text-error border-error/20' };
            default: return { label: 'QUEUED', className: 'bg-surface text-textSecondary border-border/40' };
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (isLoading) return (
        <div className="space-y-10">
            <SkeletonPageHeader />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <div className="h-64 bg-surface rounded-[2rem] animate-pulse" />
                    <div className="h-32 bg-surface rounded-[2rem] animate-pulse" />
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        </div>
    );

    if (error) return <ErrorState error={error as Error} onRetry={() => refetch()} />;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-textPrimary tracking-tighter">Operational Tasks</h1>
                    <p className="text-sm font-medium text-textSecondary">
                        {isAdmin ? 'Orchestrate and track enterprise-level objectives.' : 'Manage assigned operational units and status.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button className="h-12 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all gap-2">
                        <Plus size={18} />
                        New Objective
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Lateral Control Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="rounded-[2.5rem] border-border/40 shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.3em] mb-8 px-1">Registry Filter</h4>
                            <div className="space-y-2">
                                {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={cn(
                                            "w-full text-left px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                                            filterStatus === status
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-textSecondary hover:bg-surface hover:text-textPrimary"
                                        )}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-surface border border-border/40 relative group overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Target size={160} className="text-primary" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-3 relative z-10">Efficiency Index</p>
                        <div className="flex items-baseline gap-2 relative z-10 mb-4">
                            <span className="text-4xl font-bold text-textPrimary tracking-tighter">84.2</span>
                            <span className="text-sm font-bold text-success uppercase">Percent</span>
                        </div>
                        <p className="text-xs font-medium text-textSecondary leading-relaxed relative z-10">System nodes are operating at optimal throughput.</p>
                    </div>
                </div>

                {/* Task Grid */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                            <Search size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search Registry Objectives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pl-14 pr-16 rounded-2xl bg-white border-border/60 shadow-sm focus:shadow-md transition-all font-bold"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                            <Filter size={18} className="text-textSecondary/40" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
                        {filteredTasks.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState
                                    title={filterStatus === 'all' ? "No Tasks Assigned" : `No ${filterStatus.replace('_', ' ')} objectives`}
                                    description={filterStatus === 'all'
                                        ? "There are currently no tasks in the enterprise registry."
                                        : `No operational units match the selected state filter.`
                                    }
                                    icon={ClipboardCheck}
                                />
                            </div>
                        ) : filteredTasks.map((task: any) => {
                            const priority = getPriorityConfig(task.priority);
                            const status = getStatusInfo(task.status);
                            
                            return (
                                <Card key={task.id} className="rounded-[2.5rem] border-border/40 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 bg-white group overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <Badge variant="outline" className={cn("px-3 py-1 rounded-lg border-none text-[9px] font-bold tracking-widest", priority.color + "/10", priority.color.replace('bg-', 'text-'))}>
                                                {priority.label}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Badge className={cn("px-2.5 py-1 rounded-lg font-bold tracking-[0.1em] text-[9px] shadow-none", status.className)}>
                                                    {status.label}
                                                </Badge>
                                                <button className="w-8 h-8 flex items-center justify-center text-textSecondary/40 hover:text-textPrimary transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-textPrimary mb-2 truncate group-hover:text-primary transition-colors tracking-tight">
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-textSecondary font-medium line-clamp-2 leading-relaxed mb-8">
                                            {task.description || 'No operational description provided for this objective.'}
                                        </p>

                                        <div className="flex items-center justify-between pt-8 border-t border-border/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-surface border border-border/40 flex items-center justify-center text-xs font-bold text-primary shadow-inner">
                                                    {(task.employees?.full_name || 'G').charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest truncate max-w-[120px]">
                                                        {task.employees?.full_name || 'Global Node'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-2 text-textSecondary/60 font-bold text-[10px] uppercase tracking-widest">
                                                    <Clock size={12} />
                                                    <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Ongoing'}</span>
                                                </div>

                                                {!isAdmin && task.status !== 'completed' && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(task.id, 'completed')}
                                                        variant="ghost"
                                                        className="w-10 h-10 p-0 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all border border-primary/10 shadow-sm"
                                                    >
                                                        <CheckSquare size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

