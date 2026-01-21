import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  LogOut,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/api/useAuthQueries';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const logoutMutation = useLogout();

  const profile = currentUserData?.data?.profile;
  const userRole = profile?.role || 'employee';

  const handleLogout = () => {
    logoutMutation.mutate();
    // Navigation is handled by the hook/queryClient or locally
    // useLogout hook normally handles navigation but let's be safe
    // Actually, useLogout handles navigation on success.
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage HR Managers', href: '/admin/hr-management', icon: ShieldCheck },
      { name: 'Manage Employees', href: '/admin/employee-management', icon: Users },
      { name: 'User Roles & Access', href: '/admin/roles', icon: ShieldAlert },
      { name: 'Global Settings', href: '/admin/profile', icon: Settings },
    ],
    hr: [
      { name: 'Dashboard Overview', href: '/hr/dashboard', icon: LayoutDashboard },
      { name: 'Personnel Files', href: '/hr/employees', icon: Users },
      { name: 'Time Tracking', href: '/hr/attendance', icon: Clock },
      { name: 'Leave Control', href: '/hr/leaves', icon: Calendar },
      { name: 'Intelligence Reports', href: '/hr/reports', icon: FileText },
      { name: 'System Settings', href: '/hr/profile', icon: Settings },
    ],
    employee: [
      { name: 'Worker Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
      { name: 'Attendance Record', href: '/attendance', icon: Calendar },
      { name: 'Leave Requests', href: '/leaves', icon: Clock },
      { name: 'My Performance', href: '/performance', icon: BarChart3 },
      { name: 'Identity Profile', href: '/employee/profile', icon: UserCircle },
    ]
  };

  const navItems = menuItems[userRole] || menuItems.employee;

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };


  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/10 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex h-20 items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase">HiveHR</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">{userRole} Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  if (onClose) onClose();
                }}
                className={cn(
                  "w-full group flex items-center gap-x-3 rounded-md px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
                  active
                    ? "bg-white text-black shadow-lg"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-black" : "group-hover:text-white")} />
                <span className="flex-1 text-left">{item.name}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* User identification */}
        <div className="px-6 py-4 flex items-center gap-3 border-t border-white/10 mx-2 mb-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold truncate uppercase tracking-wider">{profile?.full_name || 'System User'}</p>
            <p className="text-[8px] text-white/40 truncate uppercase tracking-widest">Active Session</p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 h-12 text-white/50 hover:bg-white/5 hover:text-white rounded-md text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;