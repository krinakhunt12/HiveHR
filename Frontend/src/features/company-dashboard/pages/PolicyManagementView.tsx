import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Edit3,
    Trash2,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import {
    usePolicies as useListPolicies,
    usePolicyMutations
} from '@/features/policies/hooks/usePolicies';
import { useToast } from '@/shared/ui/toast/useToast';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Input } from '@/shared/ui/input';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

const PolicyModal = ({ isOpen, onClose, initialData, onSuccess }: PolicyModalProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [type, setType] = useState(initialData?.type || 'General');
    const [rules, setRules] = useState(initialData?.rules || '');
    const { create, update } = usePolicyMutations();
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                category: type,
                content: rules,
                is_mandatory: false // Default for now
            };

            if (initialData) {
                await update.mutateAsync({ id: initialData.id, payload });
                toast({ title: 'Policy Updated', description: 'The corporate policy has been modified.', type: 'success' });
            } else {
                await create.mutateAsync(payload);
                toast({ title: 'Policy Created', description: 'New policy has been added to the company handbook.', type: 'success' });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            // Error handled globally
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg card-premium bg-surface p-8 border border-border animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-textPrimary tracking-tight">
                            {initialData ? 'Edit Policy' : 'Create New Policy'}
                        </h3>
                        <p className="text-sm font-medium text-textSecondary">Define corporate standards and rules.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold  text-textSecondary">Policy Title</label>
                        <Input
                            required
                            type="text"
                            className="input-premium w-full bg-background/50"
                            placeholder="e.g., Remote Work Protocol"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold  text-textSecondary">Policy Category</label>
                        <select
                            className="input-premium w-full bg-background/50"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="General">General</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Leaves">Leaves</option>
                            <option value="Conduct">Conduct</option>
                            <option value="Benefits">Benefits</option>
                            <option value="Safety">Safety</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold  text-textSecondary">Rules & Description</label>
                        <textarea
                            required
                            rows={6}
                            className="input-premium w-full bg-background/50 resize-none"
                            placeholder="Detail the policy rules here..."
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" type="button" onClick={onClose} className="gap-2">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={create.isPending || update.isPending}
                            className="flex-1"
                        >
                            {initialData ? 'Update Policy' : 'Create Policy'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const PolicyManagementView = ({ isAdmin = false }: { isAdmin?: boolean }) => {
    const { data: response = [], isLoading, error, refetch } = useListPolicies();
    const { remove } = usePolicyMutations();
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [policyToDelete, setPolicyToDelete] = useState<{ id: string, title: string } | null>(null);

    const policies = Array.isArray(response) ? response : [];

    const filteredPolicies = policies.filter((p: any) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        try {
            await remove.mutateAsync(policyToDelete.id);
            toast({ title: 'Policy Deleted', description: 'The policy has been removed from the handbook.', type: 'success' });
            setPolicyToDelete(null);
        } catch (err: any) {
            // Error handled globally
        }
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

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col h-64 rounded-lg border bg-surface p-6 space-y-4">
                        <Skeleton className="h-10 w-10 rounded-lg opacity-20" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-1/4 rounded-md opacity-40" />
                        </div>
                        <Skeleton className="h-24 w-full rounded-md opacity-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12 text-left animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-xl font-medium text-textPrimary tracking-tight">Policies & Handbook</h1>
                    <p className="text-sm font-medium text-textSecondary mt-0.5">Manage and view corporate policies and guidelines.</p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => { setEditingPolicy(null); setIsModalOpen(true); }}
                    >
                        <Plus size={18} />
                        Create Policy
                    </Button>
                )}
            </div>

            <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                <Input
                    type="text"
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredPolicies.length === 0 ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <EmptyState
                        title={searchQuery ? "No search results" : "Handbook empty"}
                        description={searchQuery ? `No policies match "${searchQuery}".` : "The corporate handbook has no active policies yet."}
                        icon={FileText}
                        action={isAdmin && !searchQuery && (
                            <Button onClick={() => setIsModalOpen(true)}>
                                Create First Policy
                            </Button>
                        )}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPolicies.map((p: any) => (
                        <Card key={p.id} className="card-premium group border border-border shadow-none bg-surface transition-all hover:border-primary/20">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
                                        <FileText size={18} />
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setEditingPolicy(p); setIsModalOpen(true); }}
                                                className="h-8 w-8 text-textSecondary hover:text-primary hover:bg-primary/10"
                                            >
                                                <Edit3 size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPolicyToDelete({ id: p.id, title: p.title })}
                                                className="h-8 w-8 text-textSecondary hover:text-error hover:bg-error/10"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-medium text-textPrimary leading-tight">{p.title}</CardTitle>
                                    <p className="text-xs font-bold  text-textSecondary">{p.category}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <p className="text-sm text-textSecondary leading-relaxed line-clamp-4 font-medium mb-6">{p.content}</p>
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <span className="text-xs font-medium text-textSecondary flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </span>
                                    <Button variant="ghost" className="text-xs font-bold text-primary  flex items-center gap-1.5 group/btn hover:text-primaryLight transition-all">
                                        Read Full <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPolicy}
                onSuccess={() => { }}
            />

            <ConfirmModal
                isOpen={!!policyToDelete}
                onClose={() => setPolicyToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Policy"
                description={`Are you sure you want to delete "${policyToDelete?.title}"? This cannot be undone.`}
                isLoading={remove.isPending}
                confirmText="Delete"
                variant="destructive"
            />
        </div>
    );
};

