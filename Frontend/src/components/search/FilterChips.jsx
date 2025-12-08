import React from 'react';
import { X } from 'lucide-react';

const FilterChips = ({ filters, activeFilters, onRemoveFilter, onClearAll }) => {
  const getFilterDisplayValue = (filterKey, value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object' && value !== null) {
      if (value.from && value.to) {
        return `${value.from} to ${value.to}`;
      }
      return JSON.stringify(value);
    }
    
    return value.toString();
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    value => value !== '' && value !== null && value !== undefined && 
    (!Array.isArray(value) || value.length > 0) &&
    (typeof value !== 'object' || Object.keys(value).length > 0)
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Clear all
        </button>
      )}

      {/* Filter Chips */}
      {filters.map(filter => {
        const value = activeFilters[filter.key];
        
        if (!value || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
          return null;
        }

        return (
          <div
            key={filter.key}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{getFilterDisplayValue(filter.key, value)}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FilterChips;