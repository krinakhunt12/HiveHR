import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Sliders } from 'lucide-react';

const FilterDropdown = ({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  position = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    value => value !== '' && value !== null && value !== undefined
  );

  const getPositionClass = () => {
    switch (position) {
      case 'right':
        return 'right-0';
      case 'left':
      default:
        return 'left-0';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Sliders className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded-full">
            {Object.values(activeFilters).filter(v => v).length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-2 ${getPositionClass()} w-80 bg-white rounded-lg shadow-xl border border-gray-300 z-40`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Options */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-6">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && (
                  <div className="space-y-2">
                    {filter.options.map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(activeFilters[filter.key]) && 
                                  activeFilters[filter.key].includes(option.value)}
                          onChange={(e) => {
                            const currentValues = Array.isArray(activeFilters[filter.key]) 
                              ? activeFilters[filter.key] 
                              : [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            handleFilterChange(filter.key, newValues);
                          }}
                          className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'date' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={activeFilters[filter.key]?.from || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        from: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="From date"
                    />
                    <input
                      type="date"
                      value={activeFilters[filter.key]?.to || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        to: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="To date"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-300 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;