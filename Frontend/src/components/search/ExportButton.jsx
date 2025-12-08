import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, FileSpreadsheet, ChevronDown, Check } from 'lucide-react';
import { useExport } from '../../hooks/useExport';

const ExportButton = ({ 
  data = [], 
  filename = 'export',
  columns = [],
  onExport,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const dropdownRef = useRef(null);
  const { exportData, loading } = useExport();

  const formats = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', icon: FileSpreadsheet, description: 'JavaScript Object Notation' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format = selectedFormat) => {
    try {
      if (onExport) {
        await onExport(format);
      } else {
        await exportData(data, columns, filename, format);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Exporting...';
    return 'Export';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Export Button */}
      <button
        onClick={() => !disabled && handleExport()}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{getButtonText()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Format Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-300 z-40 w-64">
          {/* Header */}
          <div className="p-4 border-b border-gray-300">
            <h3 className="font-semibold text-gray-900">Export Options</h3>
            <p className="text-sm text-gray-600 mt-1">Choose export format</p>
          </div>

          {/* Format Options */}
          <div className="p-2">
            {formats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  onClick={() => {
                    setSelectedFormat(format.value);
                    handleExport(format.value);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Icon className="w-4 h-4 text-gray-700" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{format.label}</span>
                      {selectedFormat === format.value && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{format.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Additional Options */}
          <div className="p-4 border-t border-gray-300 bg-gray-50">
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">Include column headers</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">Format dates</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;