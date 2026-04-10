import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { User, Briefcase, Hash, Shield } from 'lucide-react';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

export const EditEmployeeModal = ({ isOpen, onClose, employee }: EditEmployeeModalProps) => {
    const { update } = useEmployeeMutations();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            await update.mutateAsync({ id: employee.id, payload: formData });
            toast({ title: 'Success', description: 'Employee details updated.', type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to update employee', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Employee Details">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                placeholder="John Doe"
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
                                    className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
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
                                    className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="EMP-001"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-1.5 block">Employment Status</label>
                        <div className="relative">
                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 outlined-none transition-all appearance-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                                <option value="terminated">Terminated</option>
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
                        Save Changes
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};
