import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Users, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { roleLabels, type AppRole } from '@/shared/auth/roles';
import { useLogin } from '@/shared/api/hooks/authHooks';

const Login = () => {
    const [role, setRole] = React.useState<AppRole>('employee');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const login = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login.mutate({ email, password, role });
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-left animate-in fade-in duration-700">
            <Link to="/" className="flex items-center gap-3 mb-10 group">
                <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                    <Users className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-textPrimary tracking-tighter">HiveHR</span>
            </Link>

            <Card className="w-full max-w-[440px] border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="text-center pt-12 pb-2 space-y-3">
                    <CardTitle className="text-3xl font-bold text-textPrimary tracking-tight">Portal Access</CardTitle>
                    <p className="text-sm font-medium text-textSecondary px-8">Authenticate with your enterprise credentials to access the operational dashboard.</p>
                </CardHeader>
                <CardContent className="pt-10 px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Work Identity</label>
                            <div className="relative group w-full">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                    <Mail size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                    placeholder="name@company.io"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em]">Security Key</label>
                                <Link to="#" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">Forgot?</Link>
                            </div>
                            <div className="relative group w-full">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                    <Lock size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Operational Role</label>
                            <div className="relative group">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as AppRole)}
                                    className="w-full h-12 px-6 bg-surface/50 border border-border/60 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all font-bold text-textPrimary appearance-none cursor-pointer"
                                >
                                    <option value="admin">{roleLabels.admin}</option>
                                    <option value="company_admin">{roleLabels.company_admin}</option>
                                    <option value="employee">{roleLabels.employee}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary/40">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {login.error && (
                            <div className="p-4 rounded-2xl bg-error/5 border border-error/20 text-error animate-in zoom-in duration-300">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <div className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        {Array.isArray((login.error as any)?.errors) ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {(login.error as any).errors.map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{String((login.error as any)?.message ?? 'Authentication Failure')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={login.isPending} 
                            className="w-full h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all gap-2"
                        >
                            {login.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Enter Dashboard <ArrowRight size={18} /></>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center pt-8 border-t border-border/20">
                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">
                            New to the grid? <Link to="/signup" className="text-primary hover:opacity-70 transition-all">Apply for access</Link>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 text-[10px] font-bold text-textSecondary uppercase tracking-[0.4em] text-center flex items-center gap-4 opacity-40">
                <ShieldCheck size={14} />
                <span>Encrypted Infrastructure</span>
                <span className="w-1 h-1 bg-border rounded-full"></span>
                <span>Operational Node 0x72</span>
            </div>
        </div>
    );
};

export default Login;
