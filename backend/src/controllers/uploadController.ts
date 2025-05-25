import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Function to delete a file
const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Deleted file:', filePath);
  }
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err: Error, _req: Request, res: Response, next: Function): void => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ 
      message: 'File upload error',
      error: err.message 
    });
    return;
  }
  next(err);
};

export const uploadImage = [
  upload.single('image'),
  handleMulterError,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Get the user's current profile image
      const user = await User.findById(req.user?._id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (user.profileImage) {
        // Delete the previous profile image if it exists
        const previousImagePath = path.join(uploadDir, path.basename(user.profileImage));
        deleteFile(previousImagePath);
      }

      // Update the image URL to be relative to the uploads directory
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Update the user's profile image in the database
      user.profileImage = imageUrl;
      await user.save();

      console.log('Uploaded image details:', {
        filename: req.file.filename,
        path: req.file.path,
        url: imageUrl
      });
      
      res.json({ 
        imageUrl,
        message: 'Profile image updated successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Server error',
          error: error.message
        });
        return;
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
]; 