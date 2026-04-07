import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building2, Users, ShieldCheck, ArrowRight, AlertCircle, Lock, Briefcase } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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
    <div className="min-h-screen bg-[var(--color-background-gray)] flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100 group-hover:bg-[var(--color-primary-hover)] transition-colors">
          <Users className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
      </Link>

      <Card className="w-full max-w-[480px] border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-10 pb-2 space-y-2">
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-main)] tracking-tight">Create your workspace</CardTitle>
            <p className="text-sm font-medium text-slate-400">Join the next generation of global HR teams</p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Last name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Corporate email</label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="jane@company.io" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Minimum 8 characters" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppRole)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium"
                >
                  <option value="admin">Main Admin</option>
                  <option value="company_admin">Company Admin</option>
                  <option value="employee">Employee</option>
                </select>
            </div>

            {role === 'company_admin' && (
              <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Company name</label>
                  <div className="relative group">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Acme Corporation" />
                  </div>
              </div>
            )}

            {role === 'employee' && (
              <>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Company ID</label>
                    <input type="text" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="UUID of company" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Employee Code</label>
                      <input type="text" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="EMP001" />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Designation</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Software Engineer" />
                      </div>
                  </div>
                </div>
              </>
            )}

            {signup.error && (
              <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                {String((signup.error as any)?.message ?? 'Signup failed')}
              </div>
            )}

            <div className="py-4 px-5 bg-slate-50/80 rounded-xl border border-slate-100 flex gap-4 items-start">
                <ShieldCheck className="text-[var(--color-primary)]/60 w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    By registering, you agree to our <span className="text-[var(--color-primary)] font-semibold cursor-pointer">Service Terms</span> and <span className="text-[var(--color-primary)] font-semibold cursor-pointer">Privacy Protocol</span>.
                </p>
            </div>

            <Button type="submit" disabled={signup.isPending} className="w-full h-11 font-semibold text-sm rounded-lg group mt-2" {...{variant: 'primary'} as any}>
              {signup.isPending ? 'Creating...' : 'Create Account'} <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-sm font-medium text-slate-400">
                Already registered? <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-hover)] transition-colors">Sign in here</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-10 text-[10px] font-medium text-slate-300 uppercase tracking-widest text-center">
        No credit card required. Instant activation.
      </div>
    </div>
  );
};

export default Signup;
