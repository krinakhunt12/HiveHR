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
    <div className="min-h-screen bg-background flex font-sans antialiased text-textPrimary">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-surface transition-all duration-300 fixed h-full z-40 overflow-hidden border-r border-border",
          isSidebarExpanded ? "w-84" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
            <Leaf className="text-primary w-5 h-5 relative z-10 animate-float" />
          </div>
          {isSidebarExpanded && (
            <div className="ml-3 overflow-hidden">
              <span className="block font-medium text-lg text-textPrimary tracking-tight leading-none font-sans">HiveHR</span>
              <span className="text-[10px] font-black text-primary tracking-[0.2em] mt-1.5 block uppercase opacity-80">{userRoleDisplay}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 md:px-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.onClick
              ? (activeInternalTab === item.path || (!activeInternalTab && navItems.indexOf(item) === 0))
              : location.pathname === item.path;

            const Content = (
              <>
                <div className={cn(
                  "shrink-0 transition-all duration-300",
                  isActive ? "text-primary scale-105" : "text-textSecondary hover:text-textPrimary"
                )}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: isSidebarExpanded ? 18 : 22 } as any)}
                </div>
                {isSidebarExpanded && (
                  <span className={cn(
                    "text-base font-medium tracking-tight transition-all",
                    isActive ? "text-primary" : "text-textSecondary hover:text-textPrimary"
                  )}>{item.label}</span>
                )}
                {isActive && isSidebarExpanded && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
              </>
            );

            const className = cn(
              "flex items-center w-full px-3 gap-3 py-2.5 rounded-lg transition-all duration-200 relative cursor-pointer mx-1",
              isActive
                ? "bg-primary/10 text-primary border border-primary/10"
                : "text-textSecondary hover:text-textPrimary hover:bg-background"
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

        <div className="mt-auto border-t border-border p-4 space-y-2">
          {isSidebarExpanded ? (
            <div className="p-2.5 bg-background rounded-lg border border-border transition-all hover:border-primary/30 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-white rounded-md flex items-center justify-center font-medium text-sm border border-white/10 shadow-none">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-textPrimary truncate tracking-tight">{userName}</p>
                  <p className="text-sm font-medium text-textSecondary uppercase tracking-wide mt-0.5">{userRoleDisplay}</p>
                </div>
                <ChevronDown size={12} className="text-textSecondary group-hover:text-textPrimary transition-colors" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center font-medium text-sm border border-primary/10">
                {userInitials}
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 text-textSecondary hover:text-error hover:bg-error/10 active:scale-95 group",
              !isSidebarExpanded && "justify-center"
            )}
          >
            <LogOut size={16} className="transition-transform" />
            {isSidebarExpanded && <span className="text-sm font-medium tracking-wide uppercase">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 bg-background",
        isSidebarExpanded ? "lg:ml-84" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1 px-2 text-textSecondary hover:text-primary hover:bg-primary/10 rounded-md transition-all active:scale-95"
            >
              {isSidebarExpanded ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="h-4 w-[1px] bg-border hidden md:block"></div>
            <h2 className="text-sm font-medium text-textSecondary uppercase tracking-widest hidden md:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded border border-primary/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Live</span>
            </div>

            <button className="relative p-1.5 text-textSecondary hover:text-primary hover:bg-primary/10 transition-all rounded-md group">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-error rounded-full border border-surface"></span>
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

