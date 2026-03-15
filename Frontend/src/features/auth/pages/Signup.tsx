import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building2, User, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const Signup = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-10 group">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
          <Users className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">HiveHr</span>
      </Link>

      <Card className="w-full max-w-md border-slate-100 shadow-xl shadow-slate-200/50">
        <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Create your account</CardTitle>
            <p className="text-sm font-medium text-slate-500">Join 2,000+ teams using HiveHr today</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" placeholder="jane@company.com" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" placeholder="Acme Inc." />
                </div>
            </div>

            <div className="py-2">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    By clicking "Create Account", you agree to our <span className="text-indigo-600 font-bold underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 font-bold underline cursor-pointer">Privacy Policy</span>.
                </p>
            </div>

            <Button type="button" className="w-full py-6 font-black uppercase tracking-widest text-xs">
                Create Account
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
                Already have an account? <Link to="/login" className="text-indigo-600 font-black">Log in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        No credit card required. 14-day free trial.
      </div>
    </div>
  );
};

export default Signup;
