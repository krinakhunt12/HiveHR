import React from "react";
import { BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const KpiChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Work Hours Trend</h3>
          <p className="text-sm text-slate-600">Last 7 days performance</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="day" 
            stroke="#64748b"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: "12px" }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="hours" 
            stroke="#0f172a" 
            strokeWidth={3}
            dot={{ fill: "#0f172a", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
            name="Hours Worked"
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KpiChart;

