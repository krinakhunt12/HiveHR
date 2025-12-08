import React from "react";
import { Calendar } from "lucide-react";

const DashboardHeader = ({ title, subtitle }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">{currentDate}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;