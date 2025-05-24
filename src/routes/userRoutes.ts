import express from 'express';
import {
  getProfile,
  updateProfile,
  getWishlist,
  getRecentlyRead,
  getFollowedUsersBooks,
  toggleWishlist,
  toggleRecentlyRead,
  toggleFollow,
  getFollowerCount,
  getFollowingCount,
  searchUsers,
  getUserProfileImage,
  getBio,
  getUserReviews,
  getListedBooks,
  getCreatedBooks,
  changePassword
} from '../controllers/userController';
import { auth } from '../middleware/auth';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.get('/search', searchUsers);
router.get('/profile/:userId', getProfile);
router.get('/profile-image/:userId', getUserProfileImage);
router.get('/bio/:userId', getBio);
router.get('/reviews/:userId', getUserReviews);
router.get('/listed-books/:userId', getListedBooks);
router.get('/created-books/:userId', getCreatedBooks);
router.get('/follower-count/:userId', getFollowerCount);
router.get('/following-count/:userId', getFollowingCount);
router.get('/recently-read/:userId', getRecentlyRead);

// Protected routes (authentication required)
router.use(auth);

router.get('/me', getProfile);
router.put('/profile/update', updateProfile);
router.put('/follow/:userId', toggleFollow);
router.get('/wishlist', getWishlist);
router.put('/addtowishlist/:bookId', toggleWishlist);
router.get('/recently-read', getRecentlyRead);
router.put('/addto-recently-read/:bookId', toggleRecentlyRead);
router.get('/followed-users-books', getFollowedUsersBooks);
router.put('/password', changePassword);

export default router; 