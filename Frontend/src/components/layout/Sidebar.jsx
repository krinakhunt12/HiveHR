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
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useSupabaseAuth();
  const userRole = profile?.role || 'employee';

  const handleLogout = async () => {
    const role = profile?.role;
    await logout();
    if (role === 'admin') navigate('/admin/login');
    else if (role === 'hr') navigate('/hr/login');
    else navigate('/employee/login');
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage HR', href: '/admin/hr-management', icon: ShieldCheck },
      { name: 'Manage Employees', href: '/admin/employee-management', icon: Users },
      { name: 'User Roles & Access', href: '/admin/roles', icon: ShieldAlert },
      { name: 'Profile / Settings', href: '/admin/profile', icon: Settings },
    ],
    hr: [
      { name: 'Dashboard Overview', href: '/hr/dashboard', icon: LayoutDashboard },
      { name: 'Employee Management', href: '/hr/employees', icon: Users },
      { name: 'Attendance Management', href: '/hr/attendance', icon: Clock },
      { name: 'Leave Management', href: '/hr/leaves', icon: Calendar },
      { name: 'Reports', href: '/hr/reports', icon: FileText },
      { name: 'Profile / Settings', href: '/hr/profile', icon: Settings },
    ],
    employee: [
      { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
      { name: 'Attendance', href: '/attendance', icon: Calendar },
      { name: 'My Leaves', href: '/leaves', icon: Clock },
      { name: 'Performance', href: '/performance', icon: BarChart3 },
      { name: 'Personal Profile', href: '/employee/profile', icon: UserCircle },
    ]
  };

  const navItems = menuItems[userRole] || menuItems.employee;

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };


  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex h-20 items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">HiveHR</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">{userRole} Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
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
                className={`
                  w-full group flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-white'}`} />
                <span className="flex-1 text-left">{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;