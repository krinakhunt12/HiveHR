import { useState, useEffect } from 'react';
import { mockKPIData } from '../data/mockKPI';

export const useKPI = (timeRange = 'monthly', department = 'all') => {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with Redis caching (fast loading)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter data based on time range and department
        const filteredData = filterKPIData(mockKPIData, timeRange, department);
        setKpiData(filteredData);
      } catch (err) {
        setError('Failed to load KPI data');
        console.error('KPI data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, department]);

  return { kpiData, loading, error };
};

const filterKPIData = (data, timeRange, department) => {
  // In a real app, this would be handled by the backend
  // Here we just simulate filtering
  let filtered = { ...data };
  
  if (department !== 'all') {
    filtered.leavesByDepartment = filtered.leavesByDepartment.filter(
      dept => dept.name.toLowerCase() === department
    );
  }

  // Adjust data based on time range
  const rangeMultipliers = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90
  };

  const multiplier = rangeMultipliers[timeRange] || 1;
  
  // Scale data based on time range (simplified)
  if (filtered.overview) {
    filtered.overview.overallProductivity = Math.min(100, filtered.overview.overallProductivity * (multiplier / 30));
  }

  return filtered;
};