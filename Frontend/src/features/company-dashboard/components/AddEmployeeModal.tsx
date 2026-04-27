import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type CreateEmployeePayload } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { UserPlus, Mail, Briefcase, Hash, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddEmployeeModal = ({ isOpen, onClose }: AddEmployeeModalProps) => {
    const { create } = useEmployeeMutations();
    const { toast } = useToast();

    const [formData, setFormData] = useState<CreateEmployeePayload>({
        full_name: '',
        email: '',
        password: 'Password123!', 
        designation: '',
        employee_code: '',
        role: 'employee',
        employment_type: 'full_time',
        is_first_login: true,
        date_of_joining: new Date().toISOString().split('T')[0],
        joined_on: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create.mutateAsync(formData);
            toast({ title: 'Employee Added', description: `${formData.full_name} is now part of the company.`, type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Add Failed', description: err.message || 'Could not add employee', type: 'error' });
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Onboard Member">
            <div className="mb-10 text-left">
                <p className="text-sm font-medium text-textSecondary">Provide the basic telemetry for the new enterprise cluster member.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <UserPlus size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                placeholder="Samuel Green"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <Mail size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                placeholder="samuel@farmgrid.io"
                            />
                        </div>
                    </div>

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
                                placeholder="Ecosystem Manager"
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
                                placeholder="AGRI-2024-XP"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">System Role</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <Shield size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as CreateEmployeePayload['role'] })}
                                className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-border/60 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer font-bold"
                            >
                                <option value="employee">Standard Employee</option>
                                <option value="company_admin">Company Administrator</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary/40">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Joining Date</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                <Calendar size={18} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                type="date"
                                required
                                value={formData.joined_on}
                                onChange={e => setFormData({ ...formData, joined_on: e.target.value })}
                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold appearance-none"
                            />
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
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={create.isPending}
                        className="h-11 px-10 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all gap-2"
                    >
                        {create.isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Confirm Admission <ArrowRight size={16} /></>
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

