import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { User, Briefcase, Hash, Shield, Save, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

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
            toast({ title: 'Profile Updated', description: `Changes for ${formData.full_name} have been saved.`, type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Save Failed', description: err.message || 'Could not update employee', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Employee">
            <div className="mb-8">
                <p className="text-sm font-medium text-textSecondary">Update the information for this employee.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all"
                                placeholder="Stakeholder Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Role</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all"
                                    placeholder="Designation"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Employee ID</label>
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    value={formData.employee_code}
                                    onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all"
                                    placeholder="ID Code"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Status</label>
                        <div className="relative group">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all appearance-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        <X size={14} />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        className="flex-[2] py-4 h-auto"
                    >
                        <Save size={16} />
                        <span>Update Employee</span>
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

