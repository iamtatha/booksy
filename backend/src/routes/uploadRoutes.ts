import express from 'express';
import { auth } from '../middleware/auth';
import { uploadImage } from '../controllers/uploadController';
import path from 'path';

const router = express.Router();

// Error handler middleware
const errorHandler = (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error('Upload route error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
};

console.log("From uploadRoutes.ts");

// Protected route for image upload
router.post('/', auth, uploadImage);

// Serve uploaded files statically from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Apply error handler
router.use(errorHandler);

export default router; 