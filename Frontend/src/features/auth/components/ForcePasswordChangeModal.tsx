import React, { useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { employeeApi } from '@/shared/api/employeeApi';
import { useToast } from '@/shared/ui/toast/useToast';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

interface ForcePasswordChangeModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export const ForcePasswordChangeModal = ({ isOpen, onSuccess }: ForcePasswordChangeModalProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            // 1. Update Password in Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (authError) throw authError;

            // 2. Update Profile Table to set is_first_login = false
            await employeeApi.updateMe({ is_first_login: false });

            toast({
                title: 'Password Updated',
                description: 'You can now continue to your dashboard.',
                type: 'success'
            });

            onSuccess();
        } catch (err: any) {
            setError(err.message || "Enter valid password");
            toast({
                title: 'Update Failed',
                description: err.message || "Could not update password",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative bg-surface rounded-[2.5rem] border border-border/50 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                
                <div className="px-10 pt-12 pb-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-textPrimary tracking-tight font-sans mb-2">Change Password</h3>
                    <p className="text-sm font-medium text-textSecondary">Please change your password to continue</p>
                </div>

                <div className="px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all text-sm font-medium"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase tracking-widest text-primary ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-premium pl-12 bg-background border-border hover:border-primary/30 focus:bg-surface transition-all text-sm font-medium"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-14 shadow-xl shadow-primary/10 group mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Update Password</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
