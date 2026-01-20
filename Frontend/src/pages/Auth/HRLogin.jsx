import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";

const HRLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading: isLoading, error: authError } = useSupabaseAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await login(email, password);
            if (result.profile?.role !== 'hr' && result.profile?.role !== 'admin') {
                showToast("Access denied. HR credentials required.", "error");
                return;
            }
            showToast("HR identity verified.", "success");
            navigate("/hr/dashboard");
        } catch (err) {
            AppLogger.error("HR login authorization failure", err);
            showToast(err.message || "Authorization failed", "error");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <BarChart3 className="text-emerald-800 w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HiveHR</h1>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm font-medium mb-4">
                            HR Command Center
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Nurture Talent & Optimize Workforce Efficiency
                        </h2>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Approve leaves, track performance metrics, and manage employee lifecycle with our intelligent HR suite.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} HiveHR. Empowering People Operations.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">HR Login</h2>
                            <p className="text-slate-600">Manage your workforce environment</p>
                        </div>

                        {(authError) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{authError}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Work Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="hr@company.com"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full group bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Enter HR Center
                                        <ShieldCheck className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500 italic">
                                Account creation is managed by Corporate IT.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRLogin;
