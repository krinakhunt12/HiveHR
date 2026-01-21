import React, { useState } from 'react';
import { FileText, Upload, Shield } from 'lucide-react';
import FileUploader from '../../components/files/FileUploader';
import FileList from '../../components/files/FileList';
import FileStats from '../../components/files/FileStats';
import { useFiles, useUploadFile, useDeleteFile, useDownloadFile } from '../../hooks/api/useFileQueries';
import { useCurrentUser } from '../../hooks/api/useAuthQueries';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FilesPage = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { data: files, isLoading: loading } = useFiles();
  const { data: userData } = useCurrentUser();
  const userRole = userData?.data?.profile?.role || 'employee';

  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();
  const downloadMutation = useDownloadFile();
  const { showToast } = useToast();

  const handleUploadSuccess = async (fileData) => {
    try {
      await uploadMutation.mutateAsync(fileData);
      setUploadModalOpen(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteMutation.mutateAsync(fileId);
    } catch (err) { }
  };

  const handleDownloadFile = async (fileId, fileName, path) => {
    try {
      await downloadMutation.mutateAsync({ path, fileName });
    } catch (err) {
      showToast('Failed to download file', 'error');
    }
  };

  const visibleFiles = (files || []).map(f => ({
    ...f,
    uploadedByName: f.user?.full_name || 'System',
    uploadedAt: f.created_at,
    type: f.category || 'General',
    size: f.size || 0
  }));

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
              onDownload={(id, name) => {
                const file = visibleFiles.find(f => f.id === id);
                handleDownloadFile(id, name, file?.file_path);
              }}
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