import React from 'react';
import { Server, Database, Cpu, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SystemHealthCard = ({ data, loading = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const systemComponents = [
    {
      name: 'API Server',
      status: data?.apiStatus || 'unknown',
      uptime: data?.apiUptime || '0%',
      icon: Server,
      description: 'Main application server'
    },
    {
      name: 'Redis Cache',
      status: data?.redisStatus || 'unknown',
      uptime: data?.redisUptime || '0%',
      icon: Database,
      description: 'In-memory data store'
    },
    {
      name: 'Database',
      status: data?.databaseStatus || 'unknown',
      uptime: data?.databaseUptime || '0%',
      icon: Cpu,
      description: 'Primary database cluster'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
      
      <div className="space-y-4">
        {systemComponents.map((component, index) => {
          const Icon = component.icon;
          return (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-500">{component.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {getStatusIcon(component.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                    {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Uptime: {component.uptime}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall System Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Overall System Status</h3>
            <p className="text-sm text-gray-500">Last updated: {data?.lastUpdated || 'Just now'}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {getStatusIcon(data?.overallStatus || 'healthy')}
              <span className={`text-lg font-semibold ${getStatusColor(data?.overallStatus || 'healthy')}`}>
                {data?.overallStatus ? data.overallStatus.charAt(0).toUpperCase() + data.overallStatus.slice(1) : 'Healthy'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;