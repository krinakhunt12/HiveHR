import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building2, Users, ShieldCheck, ArrowRight, AlertCircle, Lock, Briefcase, UserPlus, Globe } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { useSignup } from '@/shared/api/hooks/authHooks';
import { type AppRole } from '@/shared/auth/roles';

const Signup = () => {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = React.useState<AppRole>('employee');
    const [companyName, setCompanyName] = React.useState('');
    const [companyId, setCompanyId] = React.useState('');
    const [employeeCode, setEmployeeCode] = React.useState('');
    const [designation, setDesignation] = React.useState('');

    const signup = useSignup();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullName = `${firstName} ${lastName}`.trim();

        const payload: any = {
            email,
            password,
            full_name: fullName,
            role,
        };

        if (role === 'company_admin') {
            payload.company_name = companyName;
        }

        if (role === 'employee') {
            payload.company_id = companyId;
            payload.employee_code = employeeCode;
            payload.designation = designation;
        }

        signup.mutate(payload);
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-left animate-in fade-in duration-700">
            <Link to="/" className="flex items-center gap-3 mb-10 group">
                <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500">
                    <Users className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-textPrimary tracking-tighter">HiveHR</span>
            </Link>

            <Card className="w-full max-w-[540px] border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="text-center pt-12 pb-2 space-y-3">
                    <CardTitle className="text-3xl font-bold text-textPrimary tracking-tight">Onboard Workspace</CardTitle>
                    <p className="text-sm font-medium text-textSecondary px-10">Join the next generation of global HR orchestration. Standardized and secure.</p>
                </CardHeader>
                <CardContent className="pt-10 px-10 pb-12">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Given Name</label>
                                <Input 
                                    type="text" 
                                    required
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    className="h-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                    placeholder="Jane" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Family Name</label>
                                <Input 
                                    type="text" 
                                    required
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    className="h-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                    placeholder="Doe" 
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Corporate Email</label>
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
                                    placeholder="jane@company.io" 
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Access Credentials</label>
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
                                    placeholder="Min. 8 characters" 
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">System Role</label>
                            <div className="relative group">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as AppRole)}
                                    className="w-full h-12 px-6 bg-surface/50 border border-border/60 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all font-bold text-textPrimary appearance-none cursor-pointer"
                                >
                                    <option value="company_admin">Organization Administrator</option>
                                    <option value="employee">Standard Member</option>
                                    <option value="admin">Platform Operator</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary/40">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {role === 'company_admin' && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Organization Name</label>
                                <div className="relative group w-full">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                        <Building2 size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <Input 
                                        type="text" 
                                        required
                                        value={companyName} 
                                        onChange={(e) => setCompanyName(e.target.value)} 
                                        className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                        placeholder="Acme Corporation" 
                                    />
                                </div>
                            </div>
                        )}

                        {role === 'employee' && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Workspace ID (UUID)</label>
                                    <div className="relative group w-full">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                            <Globe size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input 
                                            type="text" 
                                            required
                                            value={companyId} 
                                            onChange={(e) => setCompanyId(e.target.value)} 
                                            className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                            placeholder="Enter company unique identifier" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Internal Code</label>
                                        <div className="relative group w-full">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                                <UserPlus size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input 
                                                type="text" 
                                                required
                                                value={employeeCode} 
                                                onChange={(e) => setEmployeeCode(e.target.value)} 
                                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                                placeholder="EMP001" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-textSecondary uppercase tracking-[0.2em] ml-1">Job Designation</label>
                                        <div className="relative group w-full">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                                                <Briefcase size={16} className="text-textSecondary/40 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <Input 
                                                type="text" 
                                                required
                                                value={designation} 
                                                onChange={(e) => setDesignation(e.target.value)} 
                                                className="h-12 pl-12 rounded-xl bg-surface/50 border-border/60 focus:bg-white transition-all font-bold" 
                                                placeholder="Software Engineer" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {signup.error && (
                            <div className="p-4 rounded-2xl bg-error/5 border border-error/20 text-error animate-in zoom-in duration-300">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0 " />
                                    <div className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        {Array.isArray((signup.error as any)?.errors) ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {(signup.error as any).errors.map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{String((signup.error as any)?.message ?? 'Registration Failed')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 bg-surface rounded-2xl border border-border/40 flex gap-4 items-start shadow-inner">
                            <ShieldCheck className="text-primary/60 w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-textSecondary font-bold uppercase tracking-widest leading-loose">
                                By registering, you agree to our <span className="text-primary cursor-pointer hover:opacity-70 transition-opacity">Service Terms</span> and <span className="text-primary cursor-pointer hover:opacity-70 transition-opacity">Privacy Protocol</span>.
                            </p>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={signup.isPending} 
                            className="w-full h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all gap-2"
                        >
                            {signup.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Unified Account <ArrowRight size={18} /></>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center pt-8 border-t border-border/20">
                        <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">
                            Already registered? <Link to="/login" className="text-primary hover:opacity-70 transition-colors">Sign in here</Link>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 text-[10px] font-bold text-textSecondary uppercase tracking-[0.4em] text-center opacity-40">
                No credit card required. Standard SLA activation.
            </div>
        </div>
    );
};

export default Signup;
