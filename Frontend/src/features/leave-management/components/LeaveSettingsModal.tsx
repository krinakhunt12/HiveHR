import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/toast/useToast';
import { companyAdminApi } from '@/shared/api/companyAdminApi';
import { Save, Plus, Trash2, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface LeaveSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Configuration {
    leave_type: string;
    annual_allowance: number;
}

export const LeaveSettingsModal = ({ isOpen, onClose }: LeaveSettingsModalProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState<Configuration[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchConfigs();
        }
    }, [isOpen]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await companyAdminApi.getLeaveConfigurations();
            setConfigs(res.data.map(c => ({ 
                leave_type: c.leave_type, 
                annual_allowance: c.annual_allowance 
            })));
        } catch (err: any) {
            toast({ title: 'Error', description: 'Failed to load leave settings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setConfigs([...configs, { leave_type: '', annual_allowance: 10 }]);
    };

    const handleRemove = (index: number) => {
        setConfigs(configs.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, key: keyof Configuration, value: any) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [key]: value };
        setConfigs(newConfigs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate
        if (configs.some(c => !c.leave_type.trim())) {
            return toast({ title: 'Validation Error', description: 'All leave types must have a name', type: 'error' });
        }

        setLoading(true);
        try {
            await companyAdminApi.updateLeaveConfigurations(configs);
            toast({ title: 'Settings Updated', description: 'Leave allowances have been updated successfully.', type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Update Failed', description: err.message || 'Failed to save settings', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Leave Policy Settings">
            <div className="mb-10 text-left">
                <p className="text-sm font-medium text-textSecondary font-sans leading-relaxed">
                    Define the annual leave allowances for your company. These limits apply per employee per calendar year.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    {configs.map((config, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-end gap-4 p-5 rounded-2xl bg-background/50 border border-soft group transition-all hover:bg-surface hover:border-primary/20">
                            <div className="flex-1 space-y-2 text-left w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 ml-0.5">Leave Type</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Vacation, Sick, Personal"
                                    value={config.leave_type}
                                    onChange={e => handleUpdate(index, 'leave_type', e.target.value)}
                                    className="input-premium h-11 bg-bg border-soft focus:bg-surface"
                                />
                            </div>
                            <div className="w-full sm:w-40 space-y-2 text-left">
                                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 ml-0.5">Annual Days</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={config.annual_allowance}
                                    onChange={e => handleUpdate(index, 'annual_allowance', parseInt(e.target.value))}
                                    className="input-premium h-11 bg-bg border-soft focus:bg-surface"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(index)}
                                className="h-11 w-11 text-textSecondary hover:text-error hover:bg-error/10"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    ))}

                    {configs.length === 0 && !loading && (
                        <div className="py-12 border-2 border-dashed border-soft rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary/40">
                                <ShieldCheck size={24} />
                            </div>
                            <p className="text-sm font-medium text-textSecondary">No leave policies defined yet.</p>
                             <button
                                type="button"
                                onClick={handleAdd}
                                className="text-sm font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                Add First Policy
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAdd}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        Add Type
                    </Button>
                    
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-textSecondary hover:text-error"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            className="px-8 h-12 rounded-xl shadow-lg shadow-primary/20 gap-2"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Policies'}
                            {!loading && <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
