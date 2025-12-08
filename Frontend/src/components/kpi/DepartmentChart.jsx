import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from '../shared/ChartContainer';

const DepartmentChart = ({ title, data, loading = false }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} leaves
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title={title} loading={loading}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280' }}
              axisLine={false}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="casual" 
              fill="#1f2937" 
              radius={[4, 4, 0, 0]}
              name="Casual Leaves"
            />
            <Bar 
              dataKey="sick" 
              fill="#374151" 
              radius={[4, 4, 0, 0]}
              name="Sick Leaves"
            />
            <Bar 
              dataKey="other" 
              fill="#4b5563" 
              radius={[4, 4, 0, 0]}
              name="Other Leaves"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export default DepartmentChart;