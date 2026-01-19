import React, { useState } from "react";
import { BarChart3, Mail, Lock, ArrowRight, Chrome, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading: isLoading, error: authError } = useSupabaseAuth();
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    setLocalError("");
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      // Error is handled by the hook and exposed via authError
    }
  };

  const handleGoogleSSO = () => {
    setLocalError("Google SSO is coming soon!");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEmailLogin();
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-700 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="text-slate-800 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">HiveHR</h1>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Welcome back to your workforce management hub
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Access powerful analytics, manage your team, and make data-driven HR decisions all in one place.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm text-slate-400">Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-slate-400">Support</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Comline Auto Parts Ltd. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center shadow-md">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">HiveHR</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
              <p className="text-slate-600">Access your HiveHR account</p>
            </div>

            {/* Error Message */}
            {(localError || authError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{localError || authError}</p>
              </div>
            )}

            {/* Google SSO Button */}
            <button
              onClick={handleGoogleSSO}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3.5 rounded-lg font-medium transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google SSO
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t border-slate-300"></div>
              <span className="text-sm text-slate-500 font-medium">OR</span>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            {/* Email Login Form */}
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="you@company.com"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <button className="text-sm font-medium text-slate-800 hover:text-slate-600 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={isLoading}
                className="w-full group bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <button className="font-semibold text-slate-800 hover:text-slate-600 transition-colors">
                  Contact your administrator
                </button>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Protected by enterprise-grade security. Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;