import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard/employee');
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" 
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold text-sm rounded-lg group mt-2">
                Sign in <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
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
