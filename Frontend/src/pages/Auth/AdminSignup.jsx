import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, User, ShieldPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useToast } from "../../hooks/useToast";
import AppLogger from "../../utils/AppLogger";

const AdminSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const { register, loading: isLoading, error: authError } = useSupabaseAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            const adminId = `ADM-${Date.now().toString().slice(-6)}`;
            await register(email, password, {
                full_name: fullName,
                role: 'admin',
                employee_id: adminId
            });
            showToast("Account established. Welcome, Admin.", "success");
            navigate("/admin/dashboard");
        } catch (err) {
            AppLogger.error("Administrator registration failure", err);
            showToast(err.message || "Registration failed", "error");
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 to-indigo-700 p-12 flex-col justify-between relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <BarChart3 className="text-indigo-900 w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HiveHR</h1>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-5xl font-bold text-white leading-tight">Create Your Organization Hub.</h2>
                        <p className="text-xl text-indigo-100">Establish the foundation for your workforce management and start onboarding your team today.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Registration</h2>
                            <p className="text-slate-600">Securely set up your administrator account</p>
                        </div>

                        {(authError) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{authError}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

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
                                        placeholder="admin@company.com"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Secure Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSignup}
                                disabled={isLoading}
                                className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Register Admin Account
                                        <ShieldPlus className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-600">
                                Already have an account?{" "}
                                <Link to="/admin/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
