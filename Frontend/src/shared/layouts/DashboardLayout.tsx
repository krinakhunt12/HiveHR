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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-sidebar transition-all duration-300 fixed h-full z-30",
          isSidebarExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10">
            <Users className="text-white w-4 h-4" />
          </div>
          {isSidebarExpanded && <span className="ml-3 font-semibold text-white tracking-tight">HiveHr</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                location.pathname === item.path
                  ? "bg-primary text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn(
                "shrink-0 transition-transform duration-200 group-hover:scale-110",
                location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-white"
              )}>
                {item.icon}
              </div>
              {isSidebarExpanded && (
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isSidebarExpanded ? "lg:ml-64" : "lg:ml-20"
      )}>
        <header className="h-16 bg-white border-b border-soft sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search for everything..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-soft rounded-lg text-sm focus:ring-2 focus:ring-primary/5 focus:border-primary/40 outline-none font-normal text-main"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-warning rounded-full ring-2 ring-white"></span>
                </button>
                <div className="h-6 w-[1px] bg-slate-200"></div>
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 bg-slate-100 text-primary rounded-lg flex items-center justify-center font-bold text-xs ring-2 ring-white overflow-hidden">
                        {userInitials}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-main leading-none">{userName}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{userRole}</p>
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
