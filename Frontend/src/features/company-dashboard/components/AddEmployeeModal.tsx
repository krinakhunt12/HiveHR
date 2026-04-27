import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type CreateEmployeePayload } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { UserPlus, Mail, Briefcase, Hash, Shield, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

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
        password: 'Password123!', // Default temporary password
        designation: '',
        employee_code: '',
        role: 'employee',
        employment_type: 'full_time',
        is_first_login: true,
        date_of_joining: new Date().toISOString().split('T')[0],
        joined_on: new Date().toISOString().split('T')[0], // backward compat
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
        <Dialog isOpen={isOpen} onClose={onClose} title="Add Employee">
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-textPrimary mb-1">Onboard New Talent</h3>
                <p className="text-sm text-textSecondary">Provide the basic information to create an employee account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <UserPlus className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary"
                                placeholder="e.g. Samuel Green"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Mail className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary"
                                placeholder="samuel@farmgrid.io"
                            />
                        </div>
                    </div>

                    {/* Role / Designation Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">Job Title</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Briefcase className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                required
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary"
                                placeholder="Ecosystem Manager"
                            />
                        </div>
                    </div>

                    {/* Employee ID Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">Internal Code</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Hash className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                required
                                value={formData.employee_code}
                                onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm placeholder:text-textSecondary"
                                placeholder="AGRI-2024-XP"
                            />
                        </div>
                    </div>

                    {/* Permissions / Role Select */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">System Role</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Shield className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as CreateEmployeePayload['role'] })}
                                className="w-full h-12 pl-12 pr-10 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="employee">Standard Employee</option>
                                <option value="company_admin">Company Administrator</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Join Date Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary ml-1">Joining Date</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Calendar className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="date"
                                required
                                value={formData.joined_on}
                                onChange={e => setFormData({ ...formData, joined_on: e.target.value })}
                                className="w-full h-12 pl-12 pr-4 bg-surface/50 border border-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-surface transition-all outline-none text-sm appearance-none"
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
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={create.isPending}
                        className="px-8 h-11 rounded-xl"
                    >
                        <span>Confirm Admission</span>
                        {!create.isPending && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

