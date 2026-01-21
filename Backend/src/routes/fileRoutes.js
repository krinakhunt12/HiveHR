/**
 * File Routes
 */
import express from 'express';
import { getFiles, getUploadUrl, deleteFile } from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getFiles);
router.post('/upload-url', getUploadUrl);
router.delete('/:id', deleteFile);

export default router;
