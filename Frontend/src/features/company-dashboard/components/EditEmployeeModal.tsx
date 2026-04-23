import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { User, Briefcase, Hash, Shield, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';

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
                designation: employee.designation || '',
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
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Employee">
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-textPrimary mb-1">Refine Personnel Details</h3>
                <p className="text-sm text-textSecondary">Modify the employee's core information and system status.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/80 ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <User className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary/50"
                                placeholder="Stakeholder Name"
                            />
                        </div>
                    </div>

                    {/* Role and ID Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/80 ml-1">Job Title</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Briefcase className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary/50"
                                    placeholder="Designation"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/80 ml-1">Internal Code</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Hash className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    required
                                    value={formData.employee_code}
                                    onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary/50"
                                    placeholder="ID Code"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Select */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary/80 ml-1">Account Status</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Shield className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="active">Active Presence</option>
                                <option value="inactive">Currently Inactive</option>
                                <option value="on_leave">Extended Leave</option>
                                <option value="terminated">Off-boarded</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary/50">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-4 border-t border-border/40">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 h-11 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
                    >
                        Dismiss
                    </button>
                    <Button
                        type="submit"
                        loading={update.isPending}
                        className="px-8 h-11 rounded-xl shadow-lg shadow-primary/10"
                    >
                        <span>Save Changes</span>
                        {!update.isPending && <Save size={16} className="ml-2" />}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

