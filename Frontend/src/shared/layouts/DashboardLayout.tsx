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
    <div className="min-h-screen bg-[var(--color-background-gray)] flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-[var(--color-sidebar-dark)] transition-all duration-300 fixed h-full z-30",
          isSidebarOpen ? "w-64" : "w-18"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10">
            <Users className="text-white w-4.5 h-4.5" />
          </div>
          {isSidebarOpen && <span className="text-white font-semibold text-lg tracking-tight">HiveHr</span>}
        </div>

        <nav className="flex-grow px-3 mt-4 space-y-0.5">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                location.pathname === item.path 
                  ? "bg-[var(--color-primary)] text-white" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <span className={cn(
                "shrink-0 w-5 h-5 flex items-center justify-center",
                location.pathname === item.path ? "text-white" : "text-slate-400"
              )}>
                {item.icon}
              </span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <Settings size={18} />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors mt-0.5 text-sm font-medium">
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-18"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[var(--color-border-soft)] sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:flex hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent"
            >
              <Menu size={18} />
            </button>
            <div className="relative group lg:w-80 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                    type="text" 
                    placeholder="Search for everything..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-[var(--color-border-soft)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]/5 focus:border-[var(--color-primary)]/40 outline-none font-normal"
                />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full relative transition-colors">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[var(--color-warning-orange)] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 bg-slate-100 text-[var(--color-primary)] rounded-lg flex items-center justify-center font-bold text-xs">
                    {userInitials}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-[var(--color-text-main)] leading-none">
                        {userName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{userRole}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
