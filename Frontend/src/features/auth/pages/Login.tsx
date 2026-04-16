import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { roleLabels, type AppRole } from '@/shared/auth/roles';
import { useLogin } from '@/shared/api/hooks/authHooks';

const Login = () => {
  const [role, setRole] = React.useState<AppRole>('employee');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-left">
      <Link to="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100 group-hover:bg-primary-hover transition-colors">
          <Users className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-semibold text-main tracking-tight">HiveHr</span>
      </Link>

      <Card className="w-full max-w-[400px] border-soft shadow-sm rounded-xl overflow-hidden bg-surface">
        <CardHeader className="text-center pt-10 pb-2 space-y-2">
          <CardTitle className="text-2xl font-semibold text-main tracking-tight">Welcome back</CardTitle>
          <p className="text-sm font-medium text-muted">Enter your credentials to access your portal</p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5 flex flex-col items-start w-full">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-0.5">Work Email</label>
              <div className="relative group w-full">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-3.5 h-3.5 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-soft rounded-lg text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-medium text-main placeholder:text-dim"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col items-start w-full">
              <div className="flex justify-between items-center ml-0.5 w-full">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Password</label>
                <Link to="#" className="text-xs font-semibold text-primary uppercase tracking-wider hover:opacity-70 transition-opacity">Forgot?</Link>
              </div>
              <div className="relative group w-full">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim w-3.5 h-3.5 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-soft rounded-lg text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-medium text-main placeholder:text-dim"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col items-start w-full">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-0.5">Login as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="w-full px-4 py-2.5 bg-bg/50 border border-soft rounded-lg text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-medium text-main"
              >
                <option value="admin">{roleLabels.admin}</option>
                <option value="company_admin">{roleLabels.company_admin}</option>
                <option value="employee">{roleLabels.employee}</option>
              </select>
            </div>

            {login.error && (
              <div className="px-3 py-2 rounded-lg bg-error-bg border border-error/10 text-error text-sm font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                {String((login.error as any)?.message ?? 'Login failed')}
              </div>
            )}

            <Button type="submit" disabled={login.isPending} className="w-full h-11 font-semibold text-sm rounded-lg group mt-2" variant="default">
              {login.isPending ? 'Signing in...' : 'Sign in'} <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-soft">
            <p className="text-sm font-medium text-muted">
              New to the platform? <Link to="/signup" className="text-primary font-semibold hover:text-primary-hover transition-colors">Apply for access</Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 text-xs font-medium text-dim uppercase tracking-widest text-center flex items-center gap-3">
        <span>© 2026 HIVEHR</span>
        <span className="w-1 h-1 bg-border rounded-full"></span>
        <span>Secure Infrastructure</span>
      </div>
    </div>
  );
};

export default Login;
