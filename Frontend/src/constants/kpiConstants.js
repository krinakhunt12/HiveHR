export const TIME_RANGES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

export const DEPARTMENTS = [
  { value: 'all', label: 'All Departments' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR' }
];

export const KPI_THRESHOLDS = {
  attendance: { good: 95, warning: 90 },
  productivity: { good: 85, warning: 75 },
  taskCompletion: { good: 90, warning: 80 },
  leaveRate: { good: 5, warning: 10 }
};