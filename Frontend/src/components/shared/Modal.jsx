import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ children, onClose, title, className = '' }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto animate-in fade-in-90 zoom-in-90 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={title ? 'p-6' : 'p-0'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;