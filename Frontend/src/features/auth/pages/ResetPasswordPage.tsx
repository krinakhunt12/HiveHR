import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { authApi } from '@/shared/api/authApi';
import { useToast } from '@/shared/ui/toast/useToast';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/shared/auth/store';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { session, setSession } = useAuthStore();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast({ title: 'Mismatch', description: 'Passwords do not match.', type: 'error' });
        }
        if (password.length < 6) {
            return toast({ title: 'Weak Password', description: 'Password must be at least 6 characters.', type: 'error' });
        }

        setLoading(true);
        try {
            await authApi.updatePassword(password);
            toast({ title: 'Updated', description: 'Your password has been changed successfully.', type: 'success' });

            // Clear the force_password_reset flag in the local session
            if (session) {
                setSession({
                    ...session,
                    user: { ...session.user, force_password_reset: false }
                } as any);
            }

            // Redirect based on role
            const role = session?.user.role;
            if (role === 'admin') navigate('/dashboard/admin');
            else if (role === 'company_admin') navigate('/dashboard/company');
            else navigate('/dashboard/employee');

        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to update password', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-soft shadow-2xl shadow-indigo-500/5 animate-in fade-in zoom-in duration-300">
                <CardHeader className="pt-10 pb-6 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <ShieldCheck size={32} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-main tracking-tight">Security Update Required</CardTitle>
                    <p className="text-sm font-medium text-muted mt-2">You are using a temporary password. Please set a new secure password to continue.</p>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-xs font-bold uppercase tracking-widest text-dim mb-1.5 block">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-xs font-bold uppercase tracking-widest text-dim mb-1.5 block">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-bg border border-soft rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                        placeholder="Repeat your password"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 group"
                            loading={loading}
                        >
                            Update & Continue <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
