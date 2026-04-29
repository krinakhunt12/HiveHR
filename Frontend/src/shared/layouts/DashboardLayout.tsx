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
import { Button } from '@/shared/ui/button';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick?: () => void;
  isActive?: boolean;
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
  const userRoleDisplay = rawRole === 'company_admin' ? 'Company Admin' : rawRole === 'admin' ? 'System Admin' : 'Employee';

  const userInitials = (userName || 'U').split(' ').map((n: string) => n?.[0] || '').join('').slice(0, 2).toUpperCase();

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
          "hidden lg:flex flex-col bg-surface transition-all duration-300 fixed h-full z-40 overflow-x-hidden border-r border-border",
          isSidebarExpanded ? "w-72" : "w-20"
        )}
      >
        <div className={cn(
          "h-16 flex items-center mb-2 transition-all duration-300",
          isSidebarExpanded ? "px-6" : "justify-center"
        )}>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
            <Leaf className="text-primary w-5 h-5 relative z-10 animate-float" />
          </div>
          {isSidebarExpanded && (
            <div className="ml-3 overflow-hidden">
              <span className="block font-medium text-lg text-textPrimary tracking-tight leading-none font-sans">HiveHR</span>
              <span className="text-xs font-bold text-primary mt-1.5 block">{userRoleDisplay}</span>
            </div>
          )}
        </div>

        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-300",
          isSidebarExpanded ? "px-4 md:px-8" : "px-4"
        )}>
          {navItems.map((item) => {
            const isActive = item.isActive !== undefined 
              ? item.isActive 
              : item.onClick
                ? (activeInternalTab === item.path || (!activeInternalTab && navItems.indexOf(item) === 0))
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

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
              "flex items-center w-full py-2.5 rounded-lg transition-all duration-200 relative cursor-pointer",
              isSidebarExpanded ? "px-3 gap-3 mx-1" : "justify-center px-0 mx-0 gap-0",
              isActive
                ? "bg-primary/10 text-primary border border-primary/10"
                : "text-textSecondary hover:text-textPrimary hover:bg-background"
            );

            if (item.onClick) {
              return (
                <Button variant="ghost" className={cn(className, isSidebarExpanded ? "flex flex-col items-start" : "justify-center")}
                  key={item.label} onClick={() => handleNavClick(item)}>
                  {Content}
                </Button>
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
                  <p className="text-sm font-medium text-textSecondary mt-0.5">{userRoleDisplay}</p>
                </div>
                <ChevronDown size={12} className="text-textSecondary group-hover:text-textPrimary transition-colors" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2 transition-all">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm border border-primary/10 shadow-sm">
                {userInitials}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 text-textSecondary hover:text-error hover:bg-error/10 active:scale-95 group",
              !isSidebarExpanded && "justify-center"
            )}
          >
            <LogOut size={16} className="transition-transform" />
            {isSidebarExpanded && <span className="text-sm font-medium tracking-wide uppercase">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 bg-background",
        isSidebarExpanded ? "lg:ml-72" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className={cn(
          "h-14 bg-surface border-b border-border flex items-center justify-between sticky top-0 z-20 transition-all duration-300",
          isSidebarExpanded ? "px-8" : "px-5"
        )}>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1 px-2"
              variant={"ghost"}
            >
              {isSidebarExpanded ? <X size={16} /> : <Menu size={16} />}
            </Button>
            <div className="h-4 w-[1px] bg-border hidden md:block"></div>
            <h2 className="text-sm font-medium text-textSecondary uppercase hidden md:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded border border-primary/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Live</span>
            </div>

            <Button variant="ghost" className="relative p-1.5 text-textSecondary hover:text-primary hover:bg-primary/10 transition-all rounded-md group">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-error rounded-full border border-surface"></span>
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;