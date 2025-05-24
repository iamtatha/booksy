import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { User as UserType } from '../models/user';

export interface AuthenticatedRequest extends Request {
  user?: UserType & { _id: string };
}

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user as UserType & { _id: string };
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 