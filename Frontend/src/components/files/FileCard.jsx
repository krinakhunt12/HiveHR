import React from 'react';
import { Download, Eye, Trash2, User, Calendar, Shield } from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/fileUtils';

const FileCard = ({ file, onView, onDownload, onDelete, showActions = true, isHRView = false }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️';
    return '📎';
  };

  const getTypeColor = (type) => {
    const colors = {
      resume: 'bg-blue-100 text-blue-800',
      payslip: 'bg-green-100 text-green-800',
      certificate: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-2xl">{getFileIcon(file.name)}</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
            {file.description && (
              <p className="text-sm text-gray-500 truncate">{file.description}</p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onView(file)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(file)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {(isHRView || file.uploadedBy === 'current-user') && (
              <button
                onClick={() => onDelete(file)}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
            {file.type}
          </span>
          <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
          {isHRView && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{file.uploadedByName}</span>
            </div>
          )}
        </div>

        {file.verifiedBy && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Shield className="w-3 h-3" />
            <span>Verified by {file.verifiedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCard;