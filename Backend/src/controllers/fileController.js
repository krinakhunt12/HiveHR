/**
 * File/Document Controller
 */
import { supabase } from '../config/supabase.js';
import { HTTP_STATUS } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/files
 * @desc    Get all files (filtered by role/user)
 * @access  Private
 */
export const getFiles = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const role = req.profile.role;
        const companyId = req.profile.company_id;

        let query = supabase
            .from('documents')
            .select(`
                *,
                user:profiles!user_id(full_name)
            `)
            .eq('company_id', companyId);

        if (role === 'employee') {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/files/upload-url
 * @desc    Get a pre-signed URL for uploading to Supabase Storage
 * @access  Private
 */
export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, fileType, description, category } = req.body;
        const userId = req.profile.id;
        const companyId = req.profile.company_id;

        const path = `${companyId}/${userId}/${Date.now()}_${fileName}`;

        // In a real production app, you'd use supabase.storage.from('documents').createSignedUploadUrl(path)
        // For now, we'll return the path and assume the frontend uses the client SDK with the user's token
        // Or we can just log the entry in the 'documents' table first.

        const { data, error } = await supabase
            .from('documents')
            .insert({
                user_id: userId,
                company_id: companyId,
                name: fileName,
                file_path: path,
                file_type: fileType,
                description,
                category: category || 'general',
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                ...data,
                uploadPath: path
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file
 * @access  Private
 */
export const deleteFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.profile.id;
        const role = req.profile.role;

        // Verify ownership if not admin/hr
        const { data: file, error: fetchError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !file) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'File not found');

        if (role === 'employee' && file.user_id !== userId) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Unauthorized to delete this file');
        }

        // Delete from DB
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // Delete from Storage (Optional: depend on if you want to keep orphans)
        // await supabase.storage.from('documents').remove([file.file_path]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'File deleted'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getFiles,
    getUploadUrl,
    deleteFile
};
