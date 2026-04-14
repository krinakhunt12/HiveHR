import React, { useState } from 'react';
import { 
  Users, 
  Bell, 
  ChevronRight,
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
  
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

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
          "hidden lg:flex flex-col bg-[var(--bg-sidebar)] transition-all duration-500 fixed h-full z-30 shadow-2xl overflow-hidden border-r border-white/5",
          isSidebarExpanded ? "w-72" : "w-24"
        )}
      >
        <div className="h-24 flex items-center px-6 mb-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/20 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-50"></div>
             <Leaf className="text-emerald-600 w-6 h-6 relative z-10 animate-float" />
          </div>
          {isSidebarExpanded && (
            <div className="ml-4 overflow-hidden">
                <span className="block font-bold text-xl text-white tracking-tight leading-none font-sans">HiveHr</span>
                <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mt-1 block">Agri-Enterprise</span>
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
                  isActive ? "text-white scale-110" : "text-emerald-100/40 group-hover:text-white"
                )}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: isSidebarExpanded ? 20 : 24 } as any)}
                </div>
                {isSidebarExpanded && (
                  <span className={cn(
                    "text-sm font-semibold tracking-tight transition-all",
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  )}>{item.label}</span>
                )}
                {isActive && isSidebarExpanded && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
              </>
            );

            const className = cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative cursor-pointer",
              isActive
                ? "bg-white/10 text-white shadow-sm border border-white/10 backdrop-blur-md" 
                : "text-emerald-100/60 hover:text-white hover:bg-white/5"
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

        <div className="mt-auto border-t border-white/5 p-4 space-y-2 bg-black/10 backdrop-blur-sm">
            {isSidebarExpanded ? (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 transition-all hover:border-white/10 group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-xs border border-white/10 shadow-md">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{userName}</p>
                            <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wide mt-0.5">{userRoleDisplay}</p>
                        </div>
                        <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                </div>
            ) : (
                <div className="flex justify-center py-2">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                        {userInitials}
                    </div>
                </div>
            )}
            
            <button 
                onClick={() => logout()}
                className={cn(
                    "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 text-rose-400 hover:bg-rose-500/10 active:scale-95 group",
                    !isSidebarExpanded && "justify-center"
                )}
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                {isSidebarExpanded && <span className="text-[11px] font-bold tracking-widest uppercase">Sign Out</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-500",
        isSidebarExpanded ? "lg:ml-72" : "lg:ml-24"
      )}>
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-white sticky top-0 z-20 flex items-center justify-between px-8 lg:px-12">
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-emerald-100"
                >
                    {isSidebarExpanded ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">Workspace Control</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">System Online</span>
                </div>
                
                <button className="relative p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all rounded-xl border border-transparent hover:border-emerald-100 group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
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

