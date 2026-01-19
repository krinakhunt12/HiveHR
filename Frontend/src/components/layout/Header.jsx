
import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import GlobalSearch from '../search/GlobalSearch';

const Header = ({ onMenuClick }) => {
  return (
    <header className="
      sticky top-0 z-40 
      bg-white/80 dark:bg-gray-800/80 
      backdrop-blur-md border-b 
      border-gray-200 dark:border-gray-700
      transition-colors duration-200
    ">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={onMenuClick}
              className="
                lg:hidden p-2 rounded-lg
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors
              "
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Global Search (Mobile) */}
            <button className="sm:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    John Anderson
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  JA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;