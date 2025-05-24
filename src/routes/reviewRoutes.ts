import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getBookReviews,
  getRecentReviews,
  getPopularBooksThisWeek,
  getBookFilterOptions,
} from '../controllers/reviewController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', (_req, res) => {
  res.send('Reviews API');
});

router.get('/book/:bookId', getBookReviews);
router.get('/recent', getRecentReviews);
router.get('/popular-week', getPopularBooksThisWeek);
router.get('/book-filter-options', getBookFilterOptions);

// Protected routes
router.post('/', auth, createReview);
router.put('/:reviewId', auth, updateReview);
router.delete('/:reviewId', auth, deleteReview);
router.get('/user', auth, getUserReviews);
router.post('/book/:bookId', auth, createReview);

export default router; 