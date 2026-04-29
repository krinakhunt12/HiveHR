import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useLeaveMutations, useLeaveConfigurations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaveRequestModal = ({ isOpen, onClose }: LeaveRequestModalProps) => {
    const { submit } = useLeaveMutations();
    const { data: configs = [] } = useLeaveConfigurations();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leave_type_id) {
            toast({ title: 'Validation Error', description: 'Please select an absence category.', type: 'error' });
            return;
        }

        try {
            await submit.mutateAsync({
                leave_type_id: formData.leave_type_id,
                from_date: formData.start_date,
                to_date: formData.end_date,
                reason: formData.reason
            });
            toast({ title: 'Request Sent', description: 'Your leave request has been sent for approval.', type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Request Failed', description: err.message || 'Could not send request', type: 'error' });
        }
    };


    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Request Leave">
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-textPrimary mb-1">Schedule Absence</h3>
                <p className="text-sm text-textSecondary">Submit a formal request for time off from active duty.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6 text-left">
                    {/* Leave Type Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-textSecondary">Absence Category</label>
                        <div className="relative group">
                            <select
                                required
                                disabled={submit.isPending}
                                value={formData.leave_type_id}
                                onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })}
                                className="w-full h-12 px-5 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>Select Absence Type</option>
                                {configs.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {(c.leave_type?.charAt(0).toUpperCase() || '') + (c.leave_type?.slice(1) || '')} Leave
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Date Range Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary">Commencement Date</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Calendar className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    required
                                    disabled={submit.isPending}
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary">Conclusion Date</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Calendar className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    required
                                    disabled={submit.isPending}
                                    type="date"
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-textSecondary">Rationale</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-4 flex items-center justify-center pointer-events-none">
                                <MessageSquare className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <textarea
                                required
                                disabled={submit.isPending}
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full min-h-[140px] pl-12 pr-4 py-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="State the reason for your absence..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-4 border-t border-border/40">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        className="px-6 h-11 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
                    >
                        Dismiss
                    </Button>
                    <Button
                        type="submit"
                        loading={submit.isPending}
                        className="px-8 h-11 rounded-xl group"
                    >
                        <span>Dispatch Request</span>
                        {!submit.isPending && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};
