import mongoose, { Document, Schema, Types } from 'mongoose';

export interface User extends Document {
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  profileImage?: string;
  wishlist: Types.ObjectId[];
  myReviews: mongoose.Types.ObjectId[];
  listedBooks: mongoose.Types.ObjectId[];
  isAdmin: boolean;
  permissionLevel: number;
  userType: 'Author' | 'Seller' | 'Reader';
  createdBookList: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  bio?: string;
  recentlyRead?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    wishlist: [{
      type: Schema.Types.ObjectId,
      ref: 'Book',
      default: [],
    }],
    myReviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    listedBooks: [{
      type: Schema.Types.ObjectId,
      ref: 'Book',
    }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    permissionLevel: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 5,
    },
    userType: {
      type: String,
      required: true,
      enum: ['Author', 'Seller', 'Reader'],
      default: 'Reader',
    },
    createdBookList: [{
      type: Schema.Types.ObjectId,
      ref: 'Book',
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    bio: {
      type: String,
      default: '',
    },
    recentlyRead: [{
      type: Schema.Types.ObjectId,
      ref: 'Book',
      default: [],
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<User>('User', userSchema); 