export interface User {
  _id: string;
  id?: string;  // For backward compatibility
  username: string;
  email: string;
  name: string;
  passwordHash?: string;  // Only used in backend
  profileImage?: string;
  wishlist?: string[];  // IDs of books
  myReviews?: string[];  // IDs of reviews
  listedBooks?: string[];  // IDs of books
  isAdmin?: boolean;
  permissionLevel?: number;
  userType?: 'Author' | 'Seller' | 'Reader';
  createdBookList?: string[];  // IDs of books
  followers?: string[];  // IDs of users
  following?: string[];  // IDs of users
  isFollowing?: boolean;  // Frontend-only flag
  followerCount?: number;  // Frontend-only count
  followingCount?: number;  // Frontend-only count
  readBooksCount?: number;  // Frontend-only count
  bio?: string;
  recentlyRead?: string[];  // IDs of books
  createdAt: string;
  updatedAt: string;
} 