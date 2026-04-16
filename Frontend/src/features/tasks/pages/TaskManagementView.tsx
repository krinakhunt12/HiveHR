import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    AlertCircle,
    Plus,
    MoreVertical,
    ChevronRight,
    Target,
    Search,
    Filter
} from 'lucide-react';
import { useListTasks, useTaskMutations, type TaskDirective } from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

interface TaskManagementViewProps {
    isAdmin: boolean;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ isAdmin }) => {
    const { session } = useAuthStore();
    const { toast } = useToast();
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const params = isAdmin ? {} : {};
    const { data: tasksResponse, isLoading, refetch } = useListTasks(params, isAdmin);
    const { update } = useTaskMutations(isAdmin);

    const tasks = tasksResponse?.data || [];

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await update.mutateAsync({ id, payload: { status: newStatus as any } });
            toast({
                title: 'Directive Updated',
                description: 'The strategic directive has been synchronized with the central grid.',
                type: 'success'
            });
        } catch (err: any) {
            toast({ title: 'Sync Failed', description: err.message || 'Failed to update directive', type: 'error' });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-rose-500 shadow-rose-500/20';
            case 'high': return 'bg-amber-500 shadow-amber-500/20';
            case 'medium': return 'bg-emerald-500 shadow-emerald-500/20';
            default: return 'bg-slate-300 shadow-slate-300/20';
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Secured', color: 'text-emerald-600 bg-emerald-50' };
            case 'in_progress': return { label: 'Active', color: 'text-amber-600 bg-amber-50' };
            case 'blocked': return { label: 'Stalled', color: 'text-rose-600 bg-rose-50' };
            default: return { label: 'Queue', color: 'text-slate-500 bg-slate-50' };
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight font-sans">Strategic Directives</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        {isAdmin ? 'Deploy and monitor operational targets across the ecosystem.' : 'Maintain and execute assigned operational objectives.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        New Directive
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Lateral Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="card-premium p-6 border-none shadow-premium bg-white">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Control Filter</h4>
                        <div className="space-y-2">
                            {['all', 'pending', 'in_progress', 'completed', 'blocked'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all",
                                        filterStatus === status
                                            ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-900/5 ring-1 ring-emerald-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {status.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="card-premium p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white border-none shadow-xl shadow-emerald-900/20 overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Target size={120} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 relative z-10">Efficiency Metric</p>
                        <p className="text-2xl font-bold relative z-10">84.2%</p>
                        <p className="text-xs font-medium text-emerald-300/60 mt-4 relative z-10">Operational output is within 5% of peak seasonal parameters.</p>
                    </div>
                </div>

                {/* Directive Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                        <div className="flex-1 flex items-center gap-3 px-4">
                            <Search size={18} className="text-slate-300" />
                            <input
                                type="text"
                                placeholder="Search Directives..."
                                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-300"
                            />
                        </div>
                        <button className="p-3 hover:bg-white rounded-xl transition-all text-slate-400">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-48 rounded-[2rem]" />
                            ))
                        ) : tasks.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                    <CheckSquare size={32} />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Directives In Range</p>
                            </div>
                        ) : tasks.map((task: any) => (
                            <Card key={task.id} className="card-premium group border-none shadow-premium hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("w-1.5 h-10 rounded-full", getPriorityColor(task.priority))} />
                                        <div className="flex gap-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                                                getStatusInfo(task.status).color
                                            )}>
                                                {getStatusInfo(task.status).label}
                                            </span>
                                            <button className="p-1 text-slate-200 hover:text-slate-400 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-700 mb-2 truncate group-hover:text-emerald-700 transition-colors">{task.title}</h3>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
                                        {task.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {task.employees?.full_name?.charAt(0) || 'G'}
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight truncate max-w-[100px]">
                                                {task.employees?.full_name || 'Global'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <Clock size={12} />
                                                <span className="text-xs font-bold uppercase">{task.due_date || 'Ongoing'}</span>
                                            </div>

                                            {!isAdmin && task.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                                                    className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="Complete Directive"
                                                >
                                                    <CheckSquare size={16} />
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
