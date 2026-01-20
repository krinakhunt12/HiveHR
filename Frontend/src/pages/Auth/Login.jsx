import React from "react";
import { BarChart3, Shield, Users, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const portals = [
    {
      role: "Admin",
      description: "System governance and global controls",
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      path: "/admin/login",
      color: "border-indigo-100 hover:border-indigo-500 bg-indigo-50/30",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      role: "HR Manager",
      description: "Workforce management and talent operations",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      path: "/hr/login",
      color: "border-emerald-100 hover:border-emerald-500 bg-emerald-50/30",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      role: "Employee",
      description: "Personal dashboard and self-service",
      icon: <User className="w-8 h-8 text-slate-600" />,
      path: "/employee/login",
      color: "border-slate-100 hover:border-slate-800 bg-slate-50/30",
      buttonColor: "bg-slate-800 hover:bg-slate-900"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight transition-all">HiveHR</h1>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Select Your Portal</h2>
          <p className="text-slate-600">Choose the appropriate access point to continue to your dashboard</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <div
              key={portal.role}
              className={`group flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-xl ${portal.color}`}
            >
              <div className="mb-6 p-4 rounded-xl bg-white shadow-sm inline-block self-start group-hover:scale-110 transition-transform duration-300">
                {portal.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{portal.role}</h3>
              <p className="text-slate-600 text-sm mb-8 flex-grow leading-relaxed">
                {portal.description}
              </p>
              <button
                onClick={() => navigate(portal.path)}
                className={`w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 group-hover:gap-3 ${portal.buttonColor}`}
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            By accessing HiveHR, you agree to our terms of service and security policies.
            All access is monitored for security and compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;