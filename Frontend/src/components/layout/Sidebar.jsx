import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Performance', href: '/performance', icon: BarChart3 },
    { name: 'KPI Analytics', href: '/kpi', icon: BarChart3 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="
      flex grow flex-col gap-y-5 
      bg-white dark:bg-gray-800 
      border-r border-gray-200 dark:border-gray-700
      transition-colors duration-200
    ">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              HiveHR
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Employee Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`
                    group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium w-full
                    transition-all duration-200
                    ${active 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {item.name}
                  <ChevronRight className={`
                    w-4 h-4 ml-auto transition-transform duration-200
                    ${active ? 'text-blue-600 dark:text-blue-400 rotate-90' : 'text-gray-400'}
                  `} />
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Info at Bottom */}
        <div className="mt-auto py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                John Anderson
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                john@company.com
              </p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;