import React, { useState, useEffect } from 'react';
import { useUpdatePassword } from '@/shared/api/hooks/authHooks';
import { useAuthStore } from '@/shared/auth/store';
import { useToast } from '@/shared/ui/toast/useToast';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface ForcePasswordChangeModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export const ForcePasswordChangeModal = ({ isOpen, onSuccess }: ForcePasswordChangeModalProps) => {
    const { toast } = useToast();
    const updatePassword = useUpdatePassword();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Keep visibility in sync with the prop
    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    if (!isOpen || !isVisible) return null;

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
            const res = await updatePassword.mutateAsync(formData.newPassword);

            if (res && res.session) {
                // Update the global auth store with fresh session, clearing force_password_reset
                const currentSession = useAuthStore.getState().session;
                useAuthStore.getState().setSession({
                    user: {
                        ...(currentSession?.user ?? {}),
                        ...res.user,
                        force_password_reset: false,
                        is_first_login: false,
                    },
                    access_token: res.session.access_token,
                    refresh_token: res.session.refresh_token,
                    expires_at: res.session.expires_at,
                });
                toast({ title: 'Password Updated', description: 'Welcome! Your account is now secure.', type: 'success' });
            } else {
                // If no new session returned, just clear the flags locally and re-prompt login
                const currentSession = useAuthStore.getState().session;
                if (currentSession) {
                    useAuthStore.getState().setSession({
                        ...currentSession,
                        user: { ...currentSession.user, force_password_reset: false, is_first_login: false },
                    });
                }
                toast({ title: 'Password Updated', description: 'Your password has been changed successfully.', type: 'success' });
            }
            setIsVisible(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Could not update password');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative bg-surface rounded-md border border-border/50  w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                <div className="px-10 pt-12 pb-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-textPrimary tracking-tight mb-2">Secure Your Account</h3>
                    <p className="text-sm font-medium text-textSecondary">Please set a new password to continue</p>
                </div>

                <div className="px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        {/* New Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Lock className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    required
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="pl-10 pr-10"
                                    placeholder="Min 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Lock className="w-4.5 h-4.5 text-textSecondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    required
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="pl-10 pr-10"
                                    placeholder="Repeat password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-error/5 border border-error/20 rounded-xl text-error text-xs font-semibold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-2 h-2 rounded-full bg-error shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={updatePassword.isPending}
                            loadingText="Securing Account..."
                            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 group flex items-center justify-center gap-2 mt-4"
                        >
                            <span>Update Password</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
