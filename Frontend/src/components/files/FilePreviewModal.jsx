import React from 'react';
import { X, Download, Shield, User, Calendar, FileText } from 'lucide-react';
import Modal from '../shared/Modal';
import { formatFileSize, formatDate } from '../../utils/fileUtils';

const FilePreviewModal = ({ file, onClose, onDownload }) => {
  const getFileTypeLabel = (type) => {
    const labels = {
      resume: 'Resume/CV',
      payslip: 'Payslip',
      certificate: 'Certificate',
      other: 'Other Document'
    };
    return labels[type] || type;
  };

  const canPreview = () => {
    const extension = file.name.split('.').pop().toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
  };

  const getPreviewContent = () => {
    if (!canPreview()) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">Preview not available for this file type</p>
          <p className="text-sm text-gray-500 mt-1">Please download to view the content</p>
        </div>
      );
    }

    // In a real app, you would show actual file preview
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">File preview would be displayed here</p>
        <p className="text-sm text-gray-500 mt-1">
          Actual preview implementation depends on file type and backend integration
        </p>
      </div>
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">File Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Preview */}
          <div className="lg:col-span-2">
            {getPreviewContent()}
          </div>

          {/* File Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">File Name</p>
                  <p className="text-sm text-gray-900 truncate">{file.name}</p>
                </div>
                
                {file.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-900">{file.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-sm text-gray-900 capitalize">{getFileTypeLabel(file.type)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Size</p>
                  <p className="text-sm text-gray-900">{formatFileSize(file.size)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Upload Date</p>
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Calendar className="w-4 h-4" />
                    {formatDate(file.uploadedAt)}
                  </div>
                </div>

                {file.uploadedByName && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Uploaded By</p>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <User className="w-4 h-4" />
                      {file.uploadedByName}
                    </div>
                  </div>
                )}

                {file.verifiedBy && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Verification</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      Verified by {file.verifiedBy}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-300">
              <button
                onClick={() => onDownload(file)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreviewModal;