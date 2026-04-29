import React, { useState } from 'react';
import {
    CheckSquare,
    Clock,
    Plus,
    MoreVertical,
    Target,
    Edit2,
    Trash2,
    Search,
    Filter
} from 'lucide-react';
import { TASK_STATUSES, TASK_STATUS_INFO, TASK_PRIORITY_COLORS } from '@/shared/constants';
import { useListTasks, useTaskMutations, type Task } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { TaskModal } from '../components/TaskModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/shared/ui/DropdownMenu';
import { Skeleton } from '@/shared/ui/skeleton';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Input } from '@/shared/ui/input';

interface TaskManagementViewProps {
    isAdmin: boolean;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ isAdmin }) => {
    const { toast } = useToast();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { data: tasks = [], isLoading, error, refetch } = useListTasks(
        filterStatus === 'all' ? {} : { status: filterStatus },
        isAdmin
    );
    const { update, remove } = useTaskMutations(isAdmin);

    const handleAddTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await update.mutateAsync({ id, payload: { status: newStatus as any } });
            toast({
                title: 'Task Updated',
                description: `Status changed to ${newStatus.replace('_', ' ')}.`,
                type: 'success'
            });
        } catch (err: any) {
            // Error handled globally
        }
    };

    const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await remove.mutateAsync(taskToDelete);
            toast({
                title: 'Task Deleted',
                description: 'The task has been permanently removed.',
                type: 'success'
            });
            setTaskToDelete(null);
        } catch (err: any) {
            // Error handled globally
        }
    };

    const handleDeleteTask = (id: string) => {
        setTaskToDelete(id);
    };

    const getPriorityColor = (priority: string) => {
        return TASK_PRIORITY_COLORS[priority as keyof typeof TASK_PRIORITY_COLORS] || TASK_PRIORITY_COLORS.default;
    };

    const getStatusInfo = (status: string) => {
        return TASK_STATUS_INFO[status as keyof typeof TASK_STATUS_INFO] || TASK_STATUS_INFO.pending;
    };

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-2xl font-semibold text-textPrimary tracking-tight">Task Management</h1>
                    <p className="text-sm font-medium text-textSecondary mt-1">
                        {isAdmin ? 'Manage and assign tasks for the entire organization.' : 'View and track your assigned responsibilities.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={handleAddTask}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        New Task
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-2 border border-border shadow-sm bg-white">
                        <div className="p-4 border-b border-border mb-2">
                            <h4 className="text-sm font-medium text-textSecondary uppercase">Filter by Status</h4>
                        </div>
                        <div className="space-y-1">
                            {TASK_STATUSES.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium capitalize transition-all",
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

                    <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-2xl overflow-hidden relative group text-left">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Target size={120} className="text-primary" />
                        </div>
                        <p className="text-sm font-bold text-primary mb-1 relative z-10">Productivity Index</p>
                        <p className="text-3xl font-bold text-textPrimary relative z-10">84.2%</p>
                        <p className="text-xs font-medium text-textSecondary mt-4 relative z-10">Target: 90% Efficiency</p>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-border focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                            <Input
                                type="text"
                                placeholder="Search by title or description..."
                                className="pl-12 bg-white border border-border rounded-2xl text-sm font-medium h-12 shadow-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all outline-none"
                            />
                        </div>
                        <div className="h-6 w-px bg-border mx-2" />
                        <Button variant="ghost" size="sm" className="gap-2 text-textSecondary">
                            <Filter size={14} />
                            Filters
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="p-6 rounded-md border border-primary/5 bg-white shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-5 w-24 rounded-lg opacity-30" />
                                        <Skeleton className="h-8 w-8 rounded-full opacity-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4 rounded-md" />
                                        <Skeleton className="h-3.5 w-full rounded-md opacity-40" />
                                        <Skeleton className="h-3.5 w-2/3 rounded-md opacity-40" />
                                    </div>
                                    <div className="pt-4 flex items-center justify-between border-t border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full opacity-30" />
                                            <Skeleton className="h-4 w-24 rounded-md opacity-40" />
                                        </div>
                                        <Skeleton className="h-4 w-20 rounded-md opacity-30" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex items-center justify-center p-12 bg-background border-2 border-dashed border-border rounded-3xl">
                            <EmptyState
                                title={filterStatus === 'all' ? "No Tasks Found" : `No ${filterStatus.replace('_', ' ')} tasks`}
                                description={filterStatus === 'all'
                                    ? "Start by assigning a new task to your team members."
                                    : `Try changing the status filter to see other tasks.`
                                }
                                icon={CheckSquare}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tasks.map((task: Task) => {
                                const StatusIcon = getStatusInfo(task.status).icon;
                                return (
                                    <Card key={task.id} className="group border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 bg-white text-left overflow-hidden">
                                        <div className={cn("h-1 w-full", getPriorityColor(task.priority))} />
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                    getStatusInfo(task.status).color
                                                )}>
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusIcon size={12} />
                                                        {getStatusInfo(task.status).label}
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-textSecondary hover:text-textPrimary">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        {isAdmin ? (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleEditTask(task)} className="gap-2">
                                                                    <Edit2 size={14} /> Edit Task
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteTask(task.id)}
                                                                    className="gap-2 text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 size={14} /> Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                                                                    disabled={task.status === 'in_progress'}
                                                                >
                                                                    Mark In Progress
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                                                                    disabled={task.status === 'completed'}
                                                                >
                                                                    Mark Completed
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(task.id, 'blocked')}
                                                                    disabled={task.status === 'blocked'}
                                                                >
                                                                    Mark Blocked
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <h3 className="text-lg font-bold text-textPrimary mb-2 group-hover:text-primary transition-colors tracking-tight">{task.title}</h3>
                                            <p className="text-sm text-textSecondary font-medium line-clamp-2 leading-relaxed mb-6 h-10">
                                                {task.description || 'No description provided.'}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 shadow-sm">
                                                        {task.assigned_to_employee?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-textSecondary leading-none mb-0.5">Assigned To</p>
                                                        <p className="text-xs font-bold text-textPrimary truncate max-w-[100px]">
                                                            {task.assigned_to_employee?.full_name || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs font-medium text-textSecondary leading-none mb-0.5">Due Date</p>
                                                        <div className="flex items-center gap-1.5 text-textPrimary font-bold text-xs">
                                                            <Clock size={12} className="text-textSecondary" />
                                                            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                                        </div>
                                                    </div>

                                                    {!isAdmin && task.status !== 'completed' && (
                                                        <Button
                                                            onClick={() => handleStatusUpdate(task.id, 'completed')}
                                                            size="sm"
                                                            className="h-8 w-8 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 shadow-none"
                                                            title="Complete Task"
                                                        >
                                                            <CheckSquare size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
            />

            <ConfirmModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
                isLoading={remove.isPending}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
};
