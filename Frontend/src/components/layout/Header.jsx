import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const Header = ({ onMenuClick }) => {
  const { profile } = useSupabaseAuth();

  return (
    <header className="bg-white border-b border-slate-200 h-20 sticky top-0 z-40 transition-all duration-200">
      <div className="px-6 sm:px-8 h-full flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64 lg:w-96 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or type command..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          <button className="relative p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </button>

          <div className="flex items-center gap-4 pl-5 border-l border-slate-200">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-slate-900 leading-tight">{profile?.full_name || 'System Admin'}</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{profile?.role || 'Guest'}</span>
            </div>

            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 border border-white/20">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;