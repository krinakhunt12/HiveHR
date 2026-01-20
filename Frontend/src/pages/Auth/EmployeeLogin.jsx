import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";

const EmployeeLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading: isLoading, error: authError } = useSupabaseAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await login(email, password);
            if (!result.profile) {
                showToast("Account profile initialization pending.", "error");
                return;
            }
            showToast("Employee workspace loaded.", "success");
            navigate("/employee/dashboard");
        } catch (err) {
            AppLogger.error("Employee portal access failure", err);
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
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-indigo-950 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <BarChart3 className="text-slate-800 w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HiveHR</h1>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-4">
                            Employee Self-Service
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Your Career Journey, Managed by You.
                        </h2>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Track your growth, manage leaves, and stay connected with your team through our integrated employee portal.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} HiveHR. Connecting People & Purpose.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Employee Login</h2>
                            <p className="text-slate-600">Enter your credentials to access your portal</p>
                        </div>

                        {(authError) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{authError}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Employee Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="employee@company.com"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none transition-all"
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
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full group bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <LogIn className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
