import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading: isLoading, error: authError } = useSupabaseAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await login(email, password);
            if (result.profile?.role !== 'admin') {
                showToast("Access denied. Admin portal restricted.", "error");
                return;
            }
            showToast("System access authorized", "success");
            navigate("/admin/dashboard");
        } catch (err) {
            AppLogger.error("Login authorization failure", err);
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
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600 rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <BarChart3 className="text-indigo-900 w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HiveHR</h1>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-4">
                            Administrator Portal
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Execute System-Wide Controls & Governance
                        </h2>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Manage global policies, monitor system logs, and oversee the entire workforce hierarchy with precision.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} HiveHR Enterprise. Secure Admin Terminal.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Sign In</h2>
                            <p className="text-slate-600">Authorized personnel only</p>
                        </div>

                        {(authError) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{authError}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="admin@hivehr.com"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Security Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Authorize Access
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-600">
                                Need an Admin account?{" "}
                                <Link to="/admin/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1">
                                    Create one <UserPlus className="w-4 h-4" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
