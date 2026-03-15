import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard/employee');
  };

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
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</CardTitle>
            <p className="text-sm font-medium text-slate-500">Log in to manage your workplace</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="email" 
                        required 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" 
                        placeholder="john@company.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:text-indigo-700 transition-colors">Forgot?</Link>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="password" 
                        required 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium" 
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full py-6 font-black uppercase tracking-widest text-xs">
                Log In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
                Don't have an account? <Link to="/signup" className="text-indigo-600 font-black">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        © 2026 HiveHr. Enterprise grade HR management.
      </div>
    </div>
  );
};

export default Login;
