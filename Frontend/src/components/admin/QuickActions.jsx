import React from 'react';
import { UserPlus, Settings, Bell, Shield, RefreshCw, Database } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: UserPlus,
      label: 'Add New User',
      description: 'Create new employee account',
      onClick: () => console.log('Add user clicked')
    },
    {
      icon: Settings,
      label: 'System Settings',
      description: 'Configure application settings',
      onClick: () => console.log('Settings clicked')
    },
    {
      icon: Bell,
      label: 'Send Announcement',
      description: 'Broadcast message to all users',
      onClick: () => console.log('Announcement clicked')
    },
    {
      icon: Shield,
      label: 'Manage Permissions',
      description: 'Update user roles and access',
      onClick: () => console.log('Permissions clicked')
    },
    {
      icon: RefreshCw,
      label: 'Clear Cache',
      description: 'Refresh system cache',
      onClick: () => console.log('Clear cache clicked')
    },
    {
      icon: Database,
      label: 'Backup Data',
      description: 'Create system backup',
      onClick: () => console.log('Backup clicked')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-white rounded-lg border border-gray-300 p-4 text-center hover:shadow-md transition-all hover:border-gray-400"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
              <span className="text-xs text-gray-500">{action.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;