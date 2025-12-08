import React from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/80 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div className="fixed inset-0 z-50 flex lg:hidden">
        <div className="relative flex w-full max-w-xs flex-1">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute right-4 top-4 z-50
              p-2 rounded-lg
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sidebar Content */}
          <div className="flex grow flex-col gap-y-5 w-full">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;