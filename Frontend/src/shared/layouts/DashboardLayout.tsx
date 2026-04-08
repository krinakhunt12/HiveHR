import React, { useState } from 'react';
import { 
  Users, 
  Bell, 
  Search,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useLogout } from '../api/hooks/authHooks';
import { useGetMe } from '../api/hooks/hrHooks';

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

  // FIXED: Explicitly display company_admin or employee role instead of 'authenticated'
  const userName = user?.full_name || 'User';
  const rawRole = user?.role || 'employee';
  const userRoleDisplay = rawRole === 'company_admin' ? 'Company Admin' : rawRole === 'admin' ? 'System Admin' : 'Staff Member';
  
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
      setActiveInternalTab(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-[#0F172A] transition-all duration-500 fixed h-full z-30 shadow-2xl overflow-hidden border-r border-white/5",
          isSidebarExpanded ? "w-72" : "w-24"
        )}
      >
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Users className="text-white w-5 h-5" />
          </div>
          {isSidebarExpanded && (
            <div className="ml-4 overflow-hidden">
                <span className="block font-bold text-lg text-white tracking-tight leading-none">HiveHr</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 uppercase">HR System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.onClick 
              ? (activeInternalTab === item.path || (!activeInternalTab && navItems.indexOf(item) === 0))
              : location.pathname === item.path;

            const Content = (
              <>
                <div className={cn(
                  "shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                )}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: isSidebarExpanded ? 20 : 22 } as any)}
                </div>
                {isSidebarExpanded && (
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                )}
                {isActive && isSidebarExpanded && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </>
            );

            const className = cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative cursor-pointer",
              isActive
                ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
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

        <div className="mt-auto border-t border-white/5 p-4 space-y-2 bg-white/2 backdrop-blur-sm">
            {isSidebarExpanded ? (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 transition-all hover:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/20">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{userName}</p>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide mt-0.5">{userRoleDisplay}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center py-2">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/20">
                        {userInitials}
                    </div>
                </div>
            )}
            
            <button 
                onClick={() => logout()}
                className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-rose-400 hover:bg-rose-500/10 active:scale-95 group",
                    !isSidebarExpanded && "justify-center"
                )}
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                {isSidebarExpanded && <span className="text-sm font-bold tracking-tight uppercase">Logout</span>}
            </button>
        </div>
      </aside>

      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-500",
        isSidebarExpanded ? "lg:ml-72" : "lg:ml-24"
      )}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8 lg:px-10">
            <div className="flex items-center gap-6 flex-1 max-w-xl">
                <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                >
                    {isSidebarExpanded ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl border border-transparent hover:border-indigo-100 group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </button>
            </div>
        </header>

        <div className="p-8 lg:p-12 w-full max-w-screen-2xl mx-auto overflow-hidden">
            {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
