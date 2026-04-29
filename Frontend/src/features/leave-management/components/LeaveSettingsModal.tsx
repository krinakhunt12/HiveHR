import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/toast/useToast';
import { useLeaveConfigurations, useLeaveConfigMutations } from '@/shared/api/hooks/hrHooks';
import { Save, Plus, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAuthStore } from '@/shared/auth/store';
import { detectRole } from '@/shared/utils/authUtils';
import { Skeleton } from '@/shared/ui/skeleton';

interface LeaveSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'add' | 'edit';
}

// id is present for existing types fetched from server; absent for newly added rows
interface Configuration {
    id?: string;
    leave_type: string;
    annual_allowance: number;
}

export const LeaveSettingsModal = ({ isOpen, onClose, mode = 'edit' }: LeaveSettingsModalProps) => {
    const { toast } = useToast();
    const { session } = useAuthStore();
    const role = detectRole(session?.user);
    const isSuperAdmin = role === 'admin';

    const { data: initialConfigs, isFetching: loading } = useLeaveConfigurations({ enabled: isOpen && !isSuperAdmin });
    const { update, remove } = useLeaveConfigMutations();
    const [configs, setConfigs] = useState<Configuration[]>([]);
    // Track which existing ids are pending deletion (to call DELETE on save)
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    // Only seed from server on first open, not on every re-render
    const seededRef = useRef(false);

    useEffect(() => {
        if (isOpen && !seededRef.current) {
            if (mode === 'add') {
                setConfigs([{ leave_type: '', annual_allowance: 10 }]);
                setDeletedIds([]);
                seededRef.current = true;
            } else if (initialConfigs) {
                setConfigs(initialConfigs.map(c => ({
                    id: c.id,
                    leave_type: c.leave_type,
                    annual_allowance: c.annual_allowance,
                })));
                setDeletedIds([]);
                seededRef.current = true;
            }
        }
        if (!isOpen) {
            seededRef.current = false;
        }
    }, [isOpen, initialConfigs, mode]);

    const handleAdd = () => {
        setConfigs(prev => [...prev, { leave_type: '', annual_allowance: 10 }]);
    };

    const handleRemove = (index: number) => {
        const target = configs[index];
        // If it has an id (server record), queue it for deletion on save
        if (target.id) {
            setDeletedIds(prev => [...prev, target.id!]);
        }
        setConfigs(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, key: keyof Configuration, value: any) => {
        setConfigs(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate — all rows must have a name
        if (configs.some(c => !c.leave_type.trim())) {
            return toast({ title: 'Validation Error', description: 'All leave types must have a name.', type: 'error' });
        }

        // Validate — no duplicate names in the list
        const names = configs.map(c => c.leave_type.trim().toLowerCase());
        if (new Set(names).size !== names.length) {
            return toast({ title: 'Duplicate Name', description: 'Each leave type must have a unique name.', type: 'error' });
        }

        try {
            // 1. Delete removed types
            if (deletedIds.length > 0) {
                await Promise.all(deletedIds.map(id => remove.mutateAsync(id)));
            }

            // 2. Save (create or update) remaining configs
            if (configs.length > 0) {
                await update.mutateAsync(configs);
            }

            toast({ title: 'Settings Updated', description: 'Leave policies saved successfully.', type: 'success' });
            onClose();
        } catch (err: any) {
            const msg = err?.message ?? 'Failed to save settings';
            // Surface the exact error cleanly instead of showing raw Postgres code
            toast({
                title: 'Save Failed',
                description: msg.includes('duplicate') || msg.includes('23505')
                    ? 'A leave type with that name already exists. Please use a different name.'
                    : msg,
                type: 'error',
            });
        }
    };

    const isSaving = update.isPending || remove.isPending;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={mode === 'add' ? "Add New Leave Rule" : "Leave Policy Settings"}>
            <div className="mb-10 text-left">
                <p className="text-sm font-medium text-textSecondary font-sans leading-relaxed">
                    {mode === 'add'
                        ? "Define a new leave type and its annual allowance for your company."
                        : "Define the annual leave allowances for your company. These limits apply per employee per calendar year."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    {isSuperAdmin ? (
                        <div className="py-12 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-primary/[0.02]">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Lock size={24} />
                            </div>
                            <h4 className="text-base font-bold text-textPrimary">Access Restricted</h4>
                            <p className="text-sm font-medium text-textSecondary max-w-xs mx-auto">
                                Super Admin accounts cannot manage company-specific leave types. Please log in as a Company Admin to modify these settings.
                            </p>
                        </div>
                    ) : loading && configs.length === 0 ? (
                        <div className="space-y-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-4 w-32 rounded-md opacity-40" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            ))}
                            <div className="flex gap-4 pt-4 border-t border-primary/5">
                                <Skeleton className="h-11 flex-1 rounded-xl opacity-40" />
                                <Skeleton className="h-11 flex-1 rounded-xl" />
                            </div>
                        </div>
                    ) : configs.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-soft rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <p className="text-sm font-medium text-textSecondary">No leave policies defined yet.</p>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleAdd}
                            >
                                Add First Policy
                            </Button>
                        </div>
                    ) : (
                        configs.map((config, index) => (
                            <div
                                key={config.id ?? `new-${index}`}
                                className="flex flex-col sm:flex-row items-end gap-4 p-5 rounded-2xl bg-background/50 border border-soft group transition-all hover:bg-surface hover:border-primary/20"
                            >
                                <div className="flex-1 space-y-2 text-left w-full">
                                    <label className="text-sm font-medium text-textSecondary">
                                        Leave Type
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="e.g. Vacation, Sick, Personal"
                                        value={config.leave_type}
                                        onChange={e => handleUpdate(index, 'leave_type', e.target.value)}
                                        className="h-11 bg-bg border-soft focus:bg-surface"
                                    />
                                </div>
                                <div className="w-full sm:w-40 space-y-2 text-left">
                                    <label className="text-sm font-medium text-textSecondary">
                                        Annual Days
                                    </label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={config.annual_allowance}
                                        onChange={e => handleUpdate(index, 'annual_allowance', parseInt(e.target.value) || 0)}
                                        className="h-11 bg-bg border-soft focus:bg-surface"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(index)}
                                    className="h-11 w-11 text-textSecondary hover:text-error hover:bg-error/10 flex-shrink-0"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6">
                    {!isSuperAdmin && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAdd}
                            className="gap-2"
                        >
                            <Plus size={16} />
                            Add Type
                        </Button>
                    )}

                    <div className="flex gap-4">
                        <Button variant="outline" type="button" onClick={onClose} className="gap-2">
                            Cancel
                        </Button>
                        {!isSuperAdmin && (
                            <Button
                                type="submit"
                                loading={isSaving}
                                className="px-8 h-12 rounded-xl shadow-lg gap-2"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Policies'}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
