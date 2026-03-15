import React, { useState } from 'react';
import { 
  Users, 
  Menu, 
  Bell, 
  Search,
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userRole: string;
  userName: string;
  userInitials: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  navItems, 
  userRole, 
  userName, 
  userInitials 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 fixed h-full z-30",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Users className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && <span className="text-white font-bold text-xl tracking-tight">HiveHr</span>}
        </div>

        <nav className="flex-grow px-3 mt-4 space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                location.pathname === item.path 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <span className={cn(
                "shrink-0",
                location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
              )}>
                {item.icon}
              </span>
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Settings</span>}
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors mt-1">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:flex hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative group lg:w-96 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/30 outline-none"
                />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {userInitials}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                        {userName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{userRole}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
