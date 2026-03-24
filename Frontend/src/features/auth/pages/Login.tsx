import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { roleLabels, setCurrentRole, type AppRole } from '@/shared/auth/roles';
import { setAuthSession } from '@/shared/auth/session';
import { authApi } from '@/shared/api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<AppRole>('employee');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const res = await authApi.login({ email, password });
        console.log('authApi.login -> response', res);
      setCurrentRole(res.user.role);
      setAuthSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
        expires_at: res.session.expires_at,
        user: {
          id: res.user.id,
          email: res.user.email,
          full_name: res.user.full_name,
          role: res.user.role,
          company_id: (res.user as any).company_id ?? (res.session as any).user?.company_id ?? null,
          company_name: (res.user as any).company_name ?? (res.session as any).user?.company_name ?? null,
          employee_id: (res.user as any).employee_id ?? null,
        },
      });
        console.log('after setAuthSession -> localStorage key:', localStorage.getItem('hivehr_auth_session'));

      navigate(res.redirect_to);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-gray)] flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100 group-hover:bg-[var(--color-primary-hover)] transition-colors">
          <Users className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-semibold text-[var(--color-text-main)] tracking-tight">HiveHr</span>
      </Link>

      <Card className="w-full max-w-[400px] border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-10 pb-2 space-y-2">
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-main)] tracking-tight">Welcome back</CardTitle>
            <p className="text-sm font-medium text-slate-400">Enter your credentials to access your portal</p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Work Email</label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input 
                        type="email" 
                        required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" 
                        placeholder="name@company.com"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-0.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="#" className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wider hover:opacity-70 transition-opacity">Forgot?</Link>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input 
                        type="password" 
                        required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" 
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Login as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppRole)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium"
                >
                  <option value="admin">{roleLabels.admin}</option>
                  <option value="company_admin">{roleLabels.company_admin}</option>
                  <option value="employee">{roleLabels.employee}</option>
                </select>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 font-semibold text-sm rounded-lg group mt-2">
                {isSubmitting ? 'Signing in...' : 'Sign in'} <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-sm font-medium text-slate-400">
                New to the platform? <Link to="/signup" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-hover)] transition-colors">Apply for access</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-10 text-[10px] font-medium text-slate-300 uppercase tracking-widest text-center flex items-center gap-3">
        <span>© 2026 HIVEHR</span>
        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
        <span>Secure Infrastructure</span>
      </div>
    </div>
  );
};

export default Login;
