import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useLogout } from '../api/hooks/authHooks';
import { useGetMe } from '../api/hooks/hrHooks';
import { detectRole } from '../utils/authUtils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const { data: user } = useGetMe();
  const { mutate: logout } = useLogout();

  const [activeInternalTab, setActiveInternalTab] = useState<string | null>(null);

  const userName = user?.full_name || 'User';
  const rawRole = detectRole(user);
  const userRoleDisplay = rawRole === 'company_admin' ? 'Company Admin' : rawRole === 'admin' ? 'System Admin' : 'Staff Member';

  const userInitials = userName.split(' ').map((n: any[]) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
      setActiveInternalTab(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex font-sans antialiased text-[var(--text-body)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar transition-all duration-300 fixed h-full z-40 overflow-hidden border-r border-slate-100",
          isSidebarExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 border border-blue-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-50"></div>
            <Leaf className="text-blue-600 w-5 h-5 relative z-10 animate-float" />
          </div>
          {isSidebarExpanded && (
            <div className="ml-3 overflow-hidden">
              <span className="block font-medium text-lg text-slate-900 tracking-tight leading-none font-sans">HiveHr</span>
              <span className="text-sm font-medium text-slate-400 tracking-wider mt-1 block uppercase">Management Hub</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.onClick
              ? (activeInternalTab === item.path || (!activeInternalTab && navItems.indexOf(item) === 0))
              : location.pathname === item.path;

            const Content = (
              <>
                <div className={cn(
                  "shrink-0 transition-all duration-300",
                  isActive ? "text-blue-600 scale-105" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: isSidebarExpanded ? 18 : 22 } as any)}
                </div>
                {isSidebarExpanded && (
                  <span className={cn(
                    "text-sm font-medium tracking-tight transition-all",
                    isActive ? "text-blue-700" : "text-slate-500 group-hover:text-slate-900"
                  )}>{item.label}</span>
                )}
                {isActive && isSidebarExpanded && <div className="ml-auto w-1 h-1 rounded-full bg-blue-500" />}
              </>
            );

            const className = cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative cursor-pointer mx-1",
              isActive
                ? "bg-blue-50/50 text-blue-700 border border-blue-100/50"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            );

            if (item.onClick) {
              return (
                <button key={item.label} onClick={() => handleNavClick(item)} className={className}>
                  {Content}
                </button>
              );
            }

            return (
              <Link key={item.label} to={item.path} className={className}>
                {Content}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4 space-y-2">
          {isSidebarExpanded ? (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 transition-all hover:border-slate-200 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-sm border border-white/10 shadow-md">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate tracking-tight">{userName}</p>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mt-0.5">{userRoleDisplay}</p>
                </div>
                <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center font-bold text-sm border border-blue-100">
                {userInitials}
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 group",
              !isSidebarExpanded && "justify-center"
            )}
          >
            <LogOut size={16} className="transition-transform" />
            {isSidebarExpanded && <span className="text-sm font-medium tracking-wide uppercase">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-500",
        "flex-1 flex flex-col min-h-screen transition-all duration-300 bg-[#F8FAFC]",
        isSidebarExpanded ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1 px-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95"
            >
              {isSidebarExpanded ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest hidden md:block">Management Console</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded border border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 uppercase tracking-wider">Live</span>
            </div>

            <button className="relative p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-md group">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

