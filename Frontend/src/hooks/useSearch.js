import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults = [
        {
          type: 'employee',
          title: 'Sarah Johnson',
          description: 'Senior Software Engineer - Engineering Department',
          department: 'Engineering',
          route: '/people'
        },
        {
          type: 'department',
          title: 'Engineering Department',
          description: '45 employees - 96.5% attendance rate',
          route: '/kpi'
        },
        {
          type: 'kpi',
          title: 'Q4 Performance Report',
          description: 'Department-wise performance metrics and analytics',
          route: '/reports'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    search
  };
};