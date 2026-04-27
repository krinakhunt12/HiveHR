import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { User, Briefcase, Hash, Shield, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

export const EditEmployeeModal = ({ isOpen, onClose, employee }: EditEmployeeModalProps) => {
    const { update } = useEmployeeMutations();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        full_name: '',
        designation: '',
        employee_code: '',
        status: ''
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                full_name: employee.full_name || '',
                designation: (employee as any).designation_name ?? employee.designation ?? '',
                employee_code: employee.employee_code || '',
                status: employee.status || 'active'
            });
        }
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;
        try {
            await update.mutateAsync({ id: employee.id, payload: formData });
            toast({ title: 'Profile Updated', description: `Changes for ${formData.full_name} have been saved.`, type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Save Failed', description: err.message || 'Could not update employee', type: 'error' });
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Refine Personnel">
            <div className="mb-10 text-left">
                <p className="text-sm font-medium text-textSecondary">Modify the employee's core telemetry and operational status.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 text-left">
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <User size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                placeholder="Stakeholder Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Job Title</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                    <Briefcase size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                    placeholder="Designation"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Internal Code</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                    <Hash size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    required
                                    value={formData.employee_code}
                                    onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                    className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                    placeholder="ID Code"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Account Status</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <Shield size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-border/60 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer font-bold"
                            >
                                <option value="active">Active Presence</option>
                                <option value="inactive">Currently Inactive</option>
                                <option value="on_leave">Extended Leave</option>
                                <option value="terminated">Off-boarded</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary/40">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 flex items-center justify-end gap-6 border-t border-border/20">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-11 px-6 text-sm font-bold text-textSecondary hover:text-textPrimary"
                    >
                        Dismiss
                    </Button>
                    <Button
                        type="submit"
                        disabled={update.isPending}
                        className="h-11 px-10 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all gap-2"
                    >
                        {update.isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Save Changes <Save size={16} /></>
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

