import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    Plus,
    MoreVertical,
    Target,
    Search,
    Filter
} from 'lucide-react';
import { useListTasks, useTaskMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';

interface TaskManagementViewProps {
    isAdmin: boolean;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ isAdmin }) => {
    const { toast } = useToast();
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const params = isAdmin ? {} : {};
    const { data: rawTasks = [], isLoading, error, refetch } = useListTasks(params, isAdmin);
    const { update } = useTaskMutations(isAdmin);

    const tasks = Array.isArray(rawTasks) ? rawTasks : [];

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await update.mutateAsync({ id, payload: { status: newStatus as any } });
            toast({
                title: 'Task Updated',
                description: 'The task has been updated successfully.',
                type: 'success'
            });
        } catch (err: any) {
            toast({ title: 'Update Failed', description: err.message || 'Could not update task', type: 'error' });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-error';
            case 'high': return 'bg-warning';
            case 'medium': return 'bg-primary';
            default: return 'bg-border';
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Completed', color: 'text-primary bg-primary/10 border-primary/20' };
            case 'in_progress': return { label: 'Active', color: 'text-warning bg-warning/10 border-warning/20' };
            case 'blocked': return { label: 'Blocked', color: 'text-error bg-error/10 border-error/20' };
            default: return { label: 'Pending', color: 'text-textSecondary bg-background border-border' };
        }
    };

    const filteredTasks = tasks.filter(task => filterStatus === 'all' || task.status === filterStatus);

    if (error) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <ErrorState 
                    error={error as Error} 
                    onRetry={() => refetch()} 
                />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-xl font-medium text-textPrimary tracking-tight font-sans">Tasks</h1>
                    <p className="text-sm font-medium text-textSecondary mt-0.5">
                        {isAdmin ? 'Create and track tasks for your company.' : 'View and update your assigned tasks.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        className="btn-primary"
                    >
                        <Plus size={16} />
                        New Task
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Lateral Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="card-premium p-6 border-none shadow-none bg-white">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Filter</h4>
                        <div className="space-y-2 text-left">
                            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium uppercase tracking-wider transition-all",
                                        filterStatus === status
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-textSecondary hover:text-textPrimary hover:bg-background"
                                    )}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="card-premium p-6 bg-primary/10 border border-primary/10 shadow-none overflow-hidden relative group text-left">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Target size={120} className="text-primary" />
                        </div>
                        <p className="text-sm font-medium uppercase tracking-widest text-primary mb-2 relative z-10">Performance</p>
                        <p className="text-xl font-medium text-textPrimary relative z-10">84.2%</p>
                        <p className="text-sm font-medium text-textSecondary mt-4 relative z-10">Tasks are being completed on time.</p>
                    </div>
                </div>

                {/* Task Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-4 bg-surface p-1 rounded-lg border border-border">
                        <div className="flex-1 flex items-center gap-3 px-3">
                            <Search size={16} className="text-textSecondary" />
                            <input
                                type="text"
                                placeholder="Search Tasks..."
                                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-textSecondary text-left"
                            />
                        </div>
                        <button className="p-2 hover:bg-background rounded-md transition-all text-textSecondary border border-transparent hover:border-border">
                            <Filter size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-48 rounded-[2rem]" />
                            ))
                        ) : filteredTasks.length === 0 ? (
                            <div className="col-span-full flex items-center justify-center">
                                <EmptyState 
                                    title={filterStatus === 'all' ? "No Tasks Assigned" : `No ${filterStatus.replace('_', ' ')} tasks`}
                                    description={filterStatus === 'all' 
                                        ? "There are currently no tasks in the enterprise registry." 
                                        : `No tasks match the selected status filter.`
                                    }
                                    icon={CheckSquare}
                                />
                            </div>
                        ) : filteredTasks.map((task: any) => (
                            <Card key={task.id} className="card-premium group border border-border shadow-none hover:border-primary/40 transition-all duration-300 bg-surface text-left">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("w-1.5 h-10 rounded-full", getPriorityColor(task.priority))} />
                                        <div className="flex gap-2">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                getStatusInfo(task.status).color
                                            )}>
                                                {getStatusInfo(task.status).label}
                                            </span>
                                            <button className="p-1 text-textSecondary hover:text-textPrimary transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-textPrimary mb-1 truncate group-hover:text-primary transition-colors tracking-tight">{task.title}</h3>
                                    <p className="text-sm text-textSecondary font-medium line-clamp-2 leading-relaxed mb-4 opacity-70">
                                        {task.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-xs font-bold text-textSecondary shadow-sm">
                                                {task.employees?.full_name?.charAt(0) || 'G'}
                                            </div>
                                            <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest truncate max-w-[100px] opacity-60">
                                                {task.employees?.full_name || 'Global'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-textSecondary font-bold text-[10px] opacity-50 uppercase tracking-widest">
                                                <Clock size={12} />
                                                <span>{task.due_date || 'Ongoing'}</span>
                                            </div>

                                            {!isAdmin && task.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                                                    className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-primary/20 shadow-sm"
                                                    title="Complete Task"
                                                >
                                                    <CheckSquare size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

