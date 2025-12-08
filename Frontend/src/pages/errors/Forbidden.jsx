import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex p-6 bg-red-100 rounded-full mb-6">
          <ShieldX className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Access Denied</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-all mx-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Forbidden;