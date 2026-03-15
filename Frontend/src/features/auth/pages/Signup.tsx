import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const Signup = () => {
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
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">First name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Last name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Corporate email</label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="jane@company.io" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-0.5">Company name</label>
                <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 transition-all font-medium placeholder:text-slate-300" placeholder="Acme Corporation" />
                </div>
            </div>

            <div className="py-4 px-5 bg-slate-50/80 rounded-xl border border-slate-100 flex gap-4 items-start">
                <ShieldCheck className="text-[var(--color-primary)]/60 w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    By registering, you agree to our <span className="text-[var(--color-primary)] font-semibold cursor-pointer">Service Terms</span> and <span className="text-[var(--color-primary)] font-semibold cursor-pointer">Privacy Protocol</span>.
                </p>
            </div>

            <Button type="button" className="w-full h-11 font-semibold text-sm rounded-lg group mt-2">
                Create Account <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
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
