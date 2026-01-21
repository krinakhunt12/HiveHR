/**
 * File Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileAPI } from '../../services/fileService';
import { toast } from '../../utils/toast';
import { supabase } from '../../config/supabase';

/**
 * Hook to get files
 */
export const useFiles = (options = {}) => {
    return useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const response = await fileAPI.getFiles();
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to upload a file
 */
export const useUploadFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, description, category }) => {
            // 1. Get database entry and path from backend
            const { data: dbEntry } = await fileAPI.getUploadUrl({
                fileName: file.name,
                fileType: file.type,
                description,
                category
            });

            // 2. Upload actual file to Supabase Storage using the path from backend
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(dbEntry.uploadPath, file);

            if (uploadError) throw uploadError;

            return dbEntry;
        },
        onSuccess: () => {
            toast.success('File uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['files'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to upload file');
        }
    });
};

/**
 * Hook to delete a file
 */
export const useDeleteFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => fileAPI.deleteFile(id),
        onSuccess: () => {
            toast.success('File deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['files'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete file');
        }
    });
};

/**
 * Hook to download a file
 */
export const useDownloadFile = () => {
    return useMutation({
        mutationFn: async ({ path, fileName }) => {
            const { data, error } = await supabase.storage
                .from('documents')
                .download(path);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });
};
