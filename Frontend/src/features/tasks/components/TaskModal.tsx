import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useListEmployees, useTaskMutations, type Task } from '@/shared/api/hooks/hrHooks';
import { Save, Calendar, User, Flag } from 'lucide-react';
import { useToast } from '@/shared/ui/toast/useToast';
import { TASK_PRIORITIES } from '@/shared/constants';

interface TaskFormData {
    title: string;
    description: string;
    assigned_to: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    due_date: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
    const { toast } = useToast();
    const { create, update } = useTaskMutations();
    const { data: employees = [] } = useListEmployees({ status: 'active' });

    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                assigned_to: task.assigned_to || '',
                priority: task.priority || 'medium',
                due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                assigned_to: '',
                priority: 'medium',
                due_date: '',
            });
        }
    }, [task, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (task) {
                await update.mutateAsync({ id: task.id, payload: formData });
                toast({ title: 'Task Updated', description: 'Changes saved successfully.', type: 'success' });
            } else {
                await create.mutateAsync(formData);
                toast({ title: 'Task Created', description: 'New task assigned successfully.', type: 'success' });
            }
            onClose();
        } catch (err: any) {
            // Error handled by QueryProvider
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'Edit Task' : 'Assign New Task'}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium text-textSecondary">Task Title</label>
                        <Input
                            required
                            placeholder="e.g. Q2 Performance Reviews"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                                <User size={14} /> Assign To
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                                <Flag size={14} /> Priority
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                            >
                                {TASK_PRIORITIES.map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                            <Calendar size={14} /> Due Date
                        </label>
                        <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium text-textSecondary">Description</label>
                        <Textarea
                            placeholder="Add details about the task..."
                            className="min-h-[120px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" type="button" onClick={onClose} className="gap-2">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="gap-2"
                        loading={create.isPending || update.isPending}
                        loadingText="Saving..."
                    >
                        <Save className="h-4 w-4" />
                        {task ? 'Update Task' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};
