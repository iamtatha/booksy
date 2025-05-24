import { Response } from 'express';
import User from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';
import Review from '../models/Review';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthenticatedRequest & { params: { userId?: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id?.toString();

    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    let user;
    // Check if userId is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId)
        .select('-passwordHash')
        .populate('followers')
        .populate('following')
        .lean()
        .exec();
    } else {
      // If not a valid ObjectId, try to find by username
      user = await User.findOne({ username: userId })
        .select('-passwordHash')
        .populate('followers')
        .populate('following')
        .lean()
        .exec();
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the current user is following this profile
    let isFollowing = false;
    if (req.user && req.user._id?.toString() !== user._id.toString()) {
      const currentUser = await User.findById(req.user._id).select('following').lean();
      isFollowing = currentUser?.following?.some(id => id.toString() === user._id.toString()) || false;
    }

    // Get additional user stats
    const [reviewCount, listedBooksCount] = await Promise.all([
      Review.countDocuments({ user: user._id }),
      User.findById(user._id).select('wishlist recentlyRead').lean()
    ]);

    // Ensure _id is included in the response
    const userResponse = {
      ...user,
      _id: user._id.toString(),
      id: user._id.toString(),
      profileImage: user.profileImage || null,
      followers: user.followers.map((follower: any) => follower._id.toString()),
      following: user.following.map((following: any) => following._id.toString()),
      isFollowing,
      stats: {
        reviewCount,
        listedBooksCount: (listedBooksCount?.wishlist?.length || 0) + (listedBooksCount?.recentlyRead?.length || 0),
        followerCount: user.followers.length,
        followingCount: user.following.length
      }
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { username, profileImage, bio } = req.body;
    const updates: { username?: string; profileImage?: string; bio?: string } = {};

    // Validate and add username to updates if provided
    if (username) {
      if (typeof username !== 'string' || username.trim().length === 0) {
        res.status(400).json({ message: 'Username must be a non-empty string' });
        return;
      }
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        res.status(400).json({ message: 'Username is already taken' });
        return;
      }
      updates.username = username.trim();
    }

    // Add profile image to updates if provided
    if (profileImage) {
      if (typeof profileImage !== 'string') {
        res.status(400).json({ message: 'Profile image must be a string' });
        return;
      }
      updates.profileImage = profileImage;
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        res.status(400).json({ message: 'Bio must be a string' });
        return;
      }
      updates.bio = bio;
    }

    // If no valid updates were provided
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: 'No valid updates provided' });
      return;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    console.log(currentPassword);

    // Validate username
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length === 0) {
      res.status(400).json({ message: 'Password is required and must be more than six characters' });
      return;
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ password: newPassword.trim() });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      res.status(400).json({ message: 'Password is already taken' });
      return;
    }

    // Update the user's password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedPassword = await User.findByIdAndUpdate(
      req.user._id,
      { passwordHash: passwordHash },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedPassword) {
      res.status(404).json({ message: 'User not found' });

      return;
    }

    res.json(updatedPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // console.log("From getWishlist Backend");
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecentlyRead = async (req: AuthenticatedRequest & { params: { userId?: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Convert userId to string if it's an ObjectId
    const userIdString = userId.toString();

    // Validate userId format
    if (!/^[0-9a-fA-F]{24}$/.test(userIdString)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const user = await User.findById(userId).populate('recentlyRead');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.recentlyRead);
  } catch (error) {
    console.error('Error fetching recently read books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserBooks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id).populate('listedBooks');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.listedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserReviews = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ username: userId });
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Use the user's _id for the review query
    const reviews = await Review.find({ user: user._id })
      .populate({
        path: 'book',
        select: 'title author coverImage averageRating'
      })
      .populate({
        path: 'user',
        select: 'username name profileImage'
      })
      .sort({ createdAt: -1 });

    // Transform the reviews to include user information
    const transformedReviews = reviews.map(review => ({
      ...review.toObject(),
      user: {
        _id: user._id,
        username: user.username,
        name: user.name || '',
        profileImage: user.profileImage || ''
      }
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getListedBooks = async (req: AuthenticatedRequest & { params: { userId?: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let user;
    const userIdStr = userId.toString();
    
    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      user = await User.findById(userIdStr).populate('listedBooks');
    } else {
      user = await User.findOne({ username: userIdStr }).populate('listedBooks');
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.listedBooks);
  } catch (error) {
    console.error('Error fetching listed books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCreatedBooks = async (req: AuthenticatedRequest & { params: { userId?: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let user;
    const userIdStr = userId.toString();
    
    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      user = await User.findById(userIdStr).populate('createdBookList');
    } else {
      user = await User.findOne({ username: userIdStr }).populate('createdBookList');
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user.createdBookList);
  } catch (error) {
    console.error('Error fetching created books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFollowerCount = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let user;
    const userIdStr = userId.toString();
    
    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      user = await User.findById(userIdStr);
    } else {
      user = await User.findOne({ username: userIdStr });
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ count: user.followers.length });
  } catch (error) {
    console.error('Error fetching follower count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFollowingCount = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let user;
    const userIdStr = userId.toString();
    
    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      user = await User.findById(userIdStr);
    } else {
      user = await User.findOne({ username: userIdStr });
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ count: user.following.length });
  } catch (error) {
    console.error('Error fetching following count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfileImage = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('profileImage').lean();
    } else {
      user = await User.findOne({ username: userId }).select('profileImage').lean();
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ profileImage: user.profileImage || '' });
  } catch (error) {
    console.error('Error fetching profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleWishlist = async (req: AuthenticatedRequest & { params: { bookId: string } }, res: Response): Promise<void> => {
  try {
    console.log("From toggleWishlist Backend");
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    console.log("From toggleWishlist Backend", req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const bookId = req.params.bookId;
    if (!user.wishlist) user.wishlist = [];
    const index = user.wishlist.findIndex(id => id.toString() === bookId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(new mongoose.Types.ObjectId(bookId));
    }
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleRecentlyRead = async (req: AuthenticatedRequest & { params: { bookId: string } }, res: Response): Promise<void> => {
  try {
    console.log("From toggleRecentlyRead Backend");
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    console.log("From toggleRecentlyRead Backend", req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const bookId = req.params.bookId;
    if (!user.recentlyRead) user.recentlyRead = [];
    const index = user.recentlyRead.findIndex(id => id.toString() === bookId);
    if (index > -1) {
      user.recentlyRead.splice(index, 1);
    } else {
      user.recentlyRead.push(new mongoose.Types.ObjectId(bookId));
    }
    await user.save();
    res.json(user.recentlyRead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBio = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('bio');
    } else {
      user = await User.findOne({ username: userId }).select('bio');
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ bio: user.bio || '' });
  } catch (error) {
    console.error('Error fetching bio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchUsers = async (req: AuthenticatedRequest & { query: { query: string } }, res: Response): Promise<void> => {
  try {
    const searchQuery = req.query.query;

    console.log("From searchUsers Backend", searchQuery);
    
    if (!searchQuery) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Search users by username or name using case-insensitive regex
    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('_id name username profileImage createdAt')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleFollow = async (req: AuthenticatedRequest & { params: { userId: string } }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    
    // Prevent self-following
    if (targetUserId === currentUserId.toString()) {
      res.status(400).json({ message: 'Cannot follow yourself' });
      return;
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isFollowing = currentUser.following.includes(targetUser._id as any);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      // Follow
      currentUser.following.push(targetUser._id as any);
      targetUser.followers.push(currentUser._id as any);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFollowedUsersBooks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      console.log('No authenticated user found');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get current user with populated following list
    const currentUser = await User.findById(req.user._id).populate('following');
    if (!currentUser) {
      console.log('Current user not found in database');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('Current user following count:', currentUser.following.length);

    // Get the IDs of users being followed
    const followedUserIds = currentUser.following;

    // Get date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find reviews from followed users in the past week
    const reviews = await Review.find({
      user: { $in: followedUserIds },
      createdAt: { $gte: oneWeekAgo }
    })
    .populate('book')
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 });

    console.log('Found reviews from followed users:', reviews.length);

    // Get recently read books from followed users
    const recentlyReadBooks = await User.find({
      _id: { $in: followedUserIds },
      recentlyRead: { $exists: true }
    })
    .select('recentlyRead username profileImage')
    .populate('recentlyRead');

    console.log('Found recently read books from followed users:', recentlyReadBooks.length);

    // Combine and format the data
    const booksWithStats = new Map();

    // Process reviews
    reviews.forEach(review => {
      const book = review.book;
      if (!booksWithStats.has(book._id.toString())) {
        booksWithStats.set(book._id.toString(), {
          book,
          reviewCount: 0,
          readCount: 0,
          recentActivity: []
        });
      }
      const bookStats = booksWithStats.get(book._id.toString());
      bookStats.reviewCount += 1;
      bookStats.recentActivity.push({
        type: 'review',
        user: review.user,
        rating: review.rating,
        date: review.createdAt
      });
    });

    // Process recently read books
    recentlyReadBooks.forEach(user => {
      if (user.recentlyRead) {
        user.recentlyRead.forEach(book => {
          if (!booksWithStats.has(book._id.toString())) {
            booksWithStats.set(book._id.toString(), {
              book,
              reviewCount: 0,
              readCount: 0,
              recentActivity: []
            });
          }
          const bookStats = booksWithStats.get(book._id.toString());
          bookStats.readCount += 1;
          bookStats.recentActivity.push({
            type: 'read',
            user: {
              _id: user._id,
              username: user.username,
              profileImage: user.profileImage
            },
            date: new Date() // Since we don't store the exact read date
          });
        });
      }
    });

    // Convert to array and sort by total activity
    const result = Array.from(booksWithStats.values())
      .sort((a, b) => (b.reviewCount + b.readCount) - (a.reviewCount + a.readCount))
      .slice(0, 8); // Limit to top 8 books

    console.log('Returning books with activity:', result.length);

    res.json(result);
  } catch (error) {
    console.error('Error fetching followed users books:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 


