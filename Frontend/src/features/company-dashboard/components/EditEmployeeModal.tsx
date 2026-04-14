import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations, type Employee } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { User, Briefcase, Hash, Shield, Save, X } from 'lucide-react';

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
            toast({ title: 'Profile Updated', description: `Changes for ${formData.full_name} have been synchronized.`, type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Update Failed', description: err.message || 'Failed to modify member', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Modify Stakeholder Metadata">
            <div className="mb-8">
                <p className="text-sm font-medium text-slate-400">Update the occupational details and status of this ecosystem member.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Identity Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                placeholder="Stakeholder Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Operational Role</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                    placeholder="Designation"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Ecosystem ID</label>
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    required
                                    value={formData.employee_code}
                                    onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                    className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                    placeholder="ID Code"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Biological/System Status</label>
                        <div className="relative group">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all appearance-none"
                            >
                                <option value="active">Operational (Active)</option>
                                <option value="inactive">Dormant (Inactive)</option>
                                <option value="on_leave">Maintenance (On Leave)</option>
                                <option value="terminated">Decommissioned (Terminated)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 flex items-center justify-center gap-2"
                    >
                        <X size={14} />
                        Discard
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-[2] btn-primary py-4 h-auto shadow-xl shadow-emerald-500/20"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving Changes...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-bold">
                                <Save size={16} />
                                <span>Commit Lifecycle Changes</span>
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

