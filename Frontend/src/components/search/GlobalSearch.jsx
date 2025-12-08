import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Building, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  
  const { results, loading, search } = useSearch();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      search(query);
    }
  }, [query, search]);

  const getResultIcon = (type) => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case 'employee':
        return <User {...iconProps} />;
      case 'department':
        return <Building {...iconProps} />;
      case 'kpi':
        return <TrendingUp {...iconProps} />;
      case 'attendance':
        return <Clock {...iconProps} />;
      default:
        return <Search {...iconProps} />;
    }
  };

  const handleResultClick = (result) => {
    // Navigate to the result's page
    console.log('Navigate to:', result);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded border">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
          >
            {/* Search Input */}
            <div className="relative p-4 border-b border-gray-300">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, departments, KPIs, reports..."
                className="w-full pl-12 pr-4 py-3 text-lg border-0 focus:outline-none focus:ring-0"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Searching...</p>
                </div>
              ) : query && results.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
                </div>
              ) : !query ? (
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Quick Access</p>
                      <div className="space-y-2">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full text-left">
                          <User className="w-4 h-4" />
                          <span>View My Profile</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full text-left">
                          <TrendingUp className="w-4 h-4" />
                          <span>Performance Reports</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Recent</p>
                      <div className="space-y-2 text-gray-600">
                        <p className="text-xs">No recent searches</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {results.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <div className="flex-shrink-0">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                            {result.type}
                          </span>
                          {result.department && (
                            <span className="text-xs text-gray-500">
                              {result.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-300 bg-gray-50">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>🔍 Search across all modules</span>
                <div className="flex gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>ESC Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;