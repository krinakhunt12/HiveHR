import React, { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog';
import { useEmployeeMutations } from '@/shared/api/hooks/hrHooks';
import { useToast } from '@/shared/ui/toast/useToast';
import { UserPlus, Mail, Briefcase, Hash, Shield, Calendar, ArrowRight } from 'lucide-react';

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
            toast({ title: 'Stakeholder Added', description: `${formData.full_name} has been integrated into the ecosystem.`, type: 'success' });
            onClose();
        } catch (err: any) {
            toast({ title: 'Integration Failed', description: err.message || 'Failed to add member', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Onboard New Stakeholder">
            <div className="mb-8">
                <p className="text-sm font-medium text-slate-400">Expand your digital ecosystem by inviting a new member to the organization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Identity Name</label>
                        <div className="relative group">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                placeholder="e.g. Samuel Green"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Communication Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                placeholder="samuel@farmgrid.io"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Operational Role</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                required
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                placeholder="Ecosystem Manager"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Ecosystem ID</label>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                required
                                value={formData.employee_code}
                                onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                                placeholder="AGRI-2024-XP"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">System Permissions</label>
                        <div className="relative group">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all appearance-none"
                            >
                                <option value="employee">Standard Member</option>
                                <option value="company_admin">Organization Lead</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ml-1">Integration Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="date"
                                value={formData.joined_on}
                                onChange={e => setFormData({ ...formData, joined_on: e.target.value })}
                                className="input-premium pl-12 bg-slate-50 border-slate-100 hover:border-emerald-200 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 px-6 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                    >
                        Abort Invite
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] btn-primary relative overflow-hidden group py-4 h-auto shadow-xl shadow-emerald-500/20"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Synchronizing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Complete Onboarding</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

