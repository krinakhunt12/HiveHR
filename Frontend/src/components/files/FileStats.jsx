import React from 'react';
import { FileText, User, Shield, PieChart } from 'lucide-react';

const FileStats = ({ files }) => {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    byType: files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {}),
    verifiedFiles: files.filter(file => file.verifiedBy).length
  };

  const formatSize = (bytes) => {
    const mb = bytes / 1024 / 1024;
    return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Files */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
            <p className="text-sm text-gray-600">Total Files</p>
          </div>
        </div>
      </div>

      {/* Total Storage */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <PieChart className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatSize(stats.totalSize)}</p>
            <p className="text-sm text-gray-600">Total Storage</p>
          </div>
        </div>
      </div>

      {/* Verified Files */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.verifiedFiles}</p>
            <p className="text-sm text-gray-600">Verified Files</p>
          </div>
        </div>
      </div>

      {/* File Types */}
      <div className="bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <User className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.byType).length}</p>
            <p className="text-sm text-gray-600">File Types</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileStats;