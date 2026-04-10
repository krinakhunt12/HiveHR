import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useEmployeeMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { UserPlus, Mail, Briefcase, Hash, Shield } from 'lucide-react';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddEmployeeModal = ({ isOpen, onClose }: AddEmployeeModalProps) => {
    const { create } = useEmployeeMutations();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: 'Password123!', // Default temporary password
        designation: '',
        employee_code: '',
        role: 'employee',
        employment_type: 'full_time',
        joined_on: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await create.mutateAsync(formData);
            toast({ title: 'Success', description: 'Employee has been invited successfully.', type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to add employee', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Work Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                placeholder="john@company.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Designation</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                                <input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    placeholder="Engineer"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Employee Code</label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                                <input
                                    required
                                    value={formData.employee_code}
                                    onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                    className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    placeholder="EMP-001"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">System Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none appearance-none"
                            >
                                <option value="employee">Employee</option>
                                <option value="company_admin">Company Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="flex-1"
                        loading={loading}
                    >
                        Create Member
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};
