import React, { useState } from 'react';
import { useUpdatePassword } from '@/shared/api/hooks/authHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

interface ForcePasswordChangeModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export const ForcePasswordChangeModal = ({ isOpen, onSuccess }: ForcePasswordChangeModalProps) => {
    const { toast } = useToast();
    const { session, setSession } = useAuthStore();
    const updatePassword = useUpdatePassword();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await updatePassword.mutateAsync(formData.newPassword);

            // Clear the force_password_reset flag in local session
            if (session) {
                setSession({
                    ...session,
                    user: { ...session.user, force_password_reset: false, is_first_login: false },
                });
            }

            toast({ title: 'Password Updated', description: 'Welcome! Your account is now secure.', type: 'success' });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Could not update password');
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
                    <h3 className="text-2xl font-bold text-textPrimary tracking-tight mb-2">Secure Your Account</h3>
                    <p className="text-sm font-medium text-textSecondary">Please set a new password to continue</p>
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
                                    placeholder="Min 8 characters"
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
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-error" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={updatePassword.isPending}
                            className="w-full btn-primary h-14 shadow-xl shadow-primary/10 group mt-4"
                        >
                            {updatePassword.isPending ? (
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
