import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  const updateFilter = useCallback((filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  const removeFilter = useCallback((filterKey) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const applyFilters = useCallback((data, filterConfig) => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
          return true;
        }

        const filter = filterConfig.find(f => f.key === key);
        if (!filter) return true;

        const itemValue = item[key];

        switch (filter.type) {
          case 'select':
            return itemValue === value;

          case 'multiselect':
            return Array.isArray(value) && value.includes(itemValue);

          case 'date':
            if (value.from && value.to) {
              const itemDate = new Date(itemValue);
              const fromDate = new Date(value.from);
              const toDate = new Date(value.to);
              return itemDate >= fromDate && itemDate <= toDate;
            }
            return true;

          case 'text':
            return itemValue?.toLowerCase().includes(value.toLowerCase());

          default:
            return true;
        }
      });
    });
  }, [activeFilters]);

  return {
    activeFilters,
    updateFilter,
    removeFilter,
    clearAllFilters,
    applyFilters
  };
};