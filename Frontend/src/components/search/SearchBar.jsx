import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  onFilterClick,
  showFilters = false,
  className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all ${
        isFocused ? 'ring-2 ring-gray-500' : ''
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Filter Button */}
        {showFilters && onFilterClick && (
          <button
            onClick={onFilterClick}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Tips */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <p>💡 <strong>Search tips:</strong></p>
            <p>• Use quotes for exact matches: <code>"John Smith"</code></p>
            <p>• Use <code>role:manager</code> to filter by role</p>
            <p>• Use <code>department:engineering</code> for departments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;