import React, { useState } from 'react';
import { 
    FileText, 
    Plus, 
    Edit3, 
    Trash2, 
    Calendar,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/utils/cn';
import { 
    useListPolicies, 
    usePolicyMutations 
} from '@/shared/api/hooks/hrHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

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
            if (initialData) {
                await update.mutateAsync({ id: initialData.id, data: { title, type, rules } });
                toast({ title: 'Policy Updated', description: 'The corporate policy has been modified.', type: 'success' });
            } else {
                await create.mutateAsync({ title, type, rules });
                toast({ title: 'Policy Created', description: 'New policy has been added to the company handbook.', type: 'success' });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast({ title: 'Action Failed', description: err.message || 'Failed to save policy', type: 'error' });
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
                        <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Policy Title</label>
                        <input
                            required
                            type="text"
                            className="input-premium w-full bg-background/50"
                            placeholder="e.g., Remote Work Protocol"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Policy Category</label>
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
                        <label className="text-xs font-bold uppercase tracking-widest text-textSecondary">Rules & Description</label>
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
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
    const { session } = useAuthStore();
    const companyId = session?.user?.company_id ?? undefined;
    const { data: response, isLoading, refetch } = useListPolicies({ company_id: companyId });
    const { remove } = usePolicyMutations();
    const { toast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const policies = response?.data || [];
    
    const filteredPolicies = policies.filter((p: any) => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete policy "${title}"? This cannot be undone.`)) return;
        try {
            await remove.mutateAsync(id);
            toast({ title: 'Policy Deleted', description: 'The policy has been removed from the handbook.', type: 'success' });
            refetch();
        } catch (err: any) {
            toast({ title: 'Deletion Failed', description: err.message || 'Failed to delete policy', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="card-premium border-border bg-surface h-64 flex flex-col p-6 space-y-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                    </Card>
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

            <div className="flex items-center gap-4 bg-surface px-4 py-1.5 rounded-xl border border-border shadow-none w-full md:w-96 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <Search size={16} className="text-textSecondary" />
                <input
                    type="text"
                    placeholder="Search policies..."
                    className="bg-transparent border-none outline-none text-sm font-medium w-full py-2 placeholder:text-textSecondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

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
                                            loading={remove.isPending && remove.variables === p.id}
                                            onClick={() => handleDelete(p.id, p.title)}
                                            className="h-8 w-8 text-textSecondary hover:text-error hover:bg-error/10"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium text-textPrimary leading-tight">{p.title}</CardTitle>
                                <p className="text-xs font-bold uppercase tracking-widest text-textSecondary opacity-80">{p.type}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p className="text-sm text-textSecondary leading-relaxed line-clamp-4 font-medium mb-6">{p.rules}</p>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-xs font-medium text-textSecondary flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {new Date(p.created_at).toLocaleDateString()}
                                </span>
                                <button className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 group/btn hover:text-primaryLight transition-all">
                                    Read Full <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPolicies.length === 0 && (
                    <div className="col-span-full py-20 card-premium border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-textSecondary">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-base font-medium text-textPrimary">No policies found</p>
                            <p className="text-sm text-textSecondary">Try adjusting your search or create a new policy.</p>
                        </div>
                    </div>
                )}
            </div>

            <PolicyModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialData={editingPolicy}
                onSuccess={refetch}
            />
        </div>
    );
};
