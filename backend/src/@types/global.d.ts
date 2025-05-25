import { Types } from 'mongoose';
import { User } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

declare namespace Express {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      username: string;
      email: string;
      passwordHash: string;
      name: string;
      profileImage?: string;
      wishlist: Types.ObjectId[];
      myReviews: Types.ObjectId[];
      listedBooks: Types.ObjectId[];
      isAdmin: boolean;
      permissionLevel: number;
      userType: 'Author' | 'Seller' | 'Reader';
      createdBookList: Types.ObjectId[];
      followers: Types.ObjectId[];
      following: Types.ObjectId[];
      bio?: string;
      recentlyRead: Types.ObjectId[];
    };
  }
} 