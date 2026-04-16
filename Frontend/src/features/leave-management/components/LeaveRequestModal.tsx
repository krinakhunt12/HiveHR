import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useLeaveMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { Calendar, MessageSquare, ArrowRight, X } from 'lucide-react';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaveRequestModal = ({ isOpen, onClose }: LeaveRequestModalProps) => {
    const { submit } = useLeaveMutations();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        leave_type: 'paid',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submit.mutateAsync(formData);
            toast({ title: 'Request Sent', description: 'Your leave request has been sent for approval.', type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Request Failed', description: err.message || 'Could not send request', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Request Leave">
            <div className="mb-8">
                <p className="text-sm font-medium text-textSecondary font-sans">Request time off from work.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Leave Type</label>
                        <select
                            required
                            value={formData.leave_type}
                            onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                            className="input-premium bg-background border-border hover:border-primary/30 focus:bg-surface transition-all appearance-none text-sm font-medium"
                        >
                            <option value="paid">Paid Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Start Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">End Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="date"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Reason</label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-4 top-4 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                            <textarea
                                required
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all min-h-[120px] pt-3 text-sm font-medium"
                                placeholder="Why are you taking leave?"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 px-6 text-sm font-medium uppercase tracking-widest text-textSecondary hover:text-error hover:bg-error/10 rounded-md transition-all border border-transparent hover:border-error/20 flex items-center justify-center gap-2"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] btn-primary py-4 h-auto shadow-none group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Send Request</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};
