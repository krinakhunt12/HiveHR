import React, { useState } from 'react';
import { FileText, Upload, Shield } from 'lucide-react';
import FileUploader from '../../components/files/FileUploader';
import FileList from '../../components/files/FileList';
import FileStats from '../../components/files/FileStats';
import { useFiles } from '../../hooks/useFiles';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FilesPage = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { files, loading, uploadFile, deleteFile, downloadFile } = useFiles();
  const { showToast } = useToast();
  const userRole = localStorage.getItem('userRole') || 'employee';

  const handleUploadSuccess = (fileData) => {
    setUploadModalOpen(false);
    showToast('File uploaded successfully!', 'success');
  };

  const handleUploadError = (error) => {
    showToast(`Upload failed: ${error}`, 'error');
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      showToast('File deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete file', 'error');
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      await downloadFile(fileId, fileName);
      showToast('File download started!', 'success');
    } catch (error) {
      showToast('Failed to download file', 'error');
    }
  };

  // Filter files based on user role
  const visibleFiles = userRole === 'hr' || userRole === 'admin' 
    ? files 
    : files.filter(file => file.uploadedBy === 'current-user');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            </div>
            <p className="text-gray-600">Securely store and manage your HR documents</p>
          </div>

          {/* File Stats */}
          <FileStats files={visibleFiles} />

          {/* Upload Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-gray-700" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
                  <p className="text-gray-600 text-sm">Securely upload your HR documents</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Document Storage</p>
                  <p className="text-sm text-gray-600">
                    All files are encrypted and stored securely. Only you and authorized HR personnel can access your documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FileList
              files={visibleFiles}
              loading={loading}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
              showActions={true}
              isHRView={userRole === 'hr' || userRole === 'admin'}
            />
          </div>

          {/* Upload Modal */}
          {uploadModalOpen && (
            <FileUploader
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onCancel={() => setUploadModalOpen(false)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FilesPage;