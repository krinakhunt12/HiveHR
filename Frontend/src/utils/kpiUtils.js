export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const formatHours = (hours) => {
  return `${hours.toFixed(1)}h`;
};

export const calculateTrend = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getDepartmentColor = (department) => {
  const colors = {
    engineering: '#1f2937',
    product: '#374151',
    design: '#4b5563',
    marketing: '#6b7280',
    sales: '#9ca3af',
    hr: '#d1d5db'
  };
  return colors[department] || '#6b7280';
};