import { useState, useEffect } from 'react';
import { mockFiles } from '../data/mockFiles';

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFiles(mockFiles);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const uploadFile = async (fileData) => {
    // Simulate file upload to S3/Cloudinary
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newFile = {
            id: Date.now().toString(),
            name: fileData.file.name,
            description: fileData.description,
            type: fileData.type,
            size: fileData.file.size,
            uploadedBy: 'current-user',
            uploadedByName: 'Current User',
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(fileData.file), // In real app, this would be S3 URL
            verifiedBy: null
          };

          setFiles(prev => [newFile, ...prev]);
          resolve(newFile);
        } catch (error) {
          reject(new Error('Upload failed'));
        }
      }, 2000);
    });
  };

  const deleteFile = async (fileId) => {
    // Simulate file deletion
    setFiles(prev => prev.filter(file => file.id !== fileId));
    return Promise.resolve();
  };

  const downloadFile = async (fileId, fileName) => {
    // Simulate file download
    const file = files.find(f => f.id === fileId);
    if (file && file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return Promise.resolve();
  };

  return {
    files,
    loading,
    uploadFile,
    deleteFile,
    downloadFile
  };
};