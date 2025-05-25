import { Request, Response } from 'express';
import Review from '../models/Review';
import Book from '../models/Book';
import { AuthenticatedRequest } from '../middleware/auth';

// Get reviews for a specific book
export const getBookReviews = async (req: Request, res: Response) => {
  console.log("getBookReviews");
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Create a new review
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("\n\n\n\n\n createReview\n\n\n\n\n");
  try {
    console.log(req.body);
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = req.user._id;
    console.log(userId);
    // Check if the book exists
    const book = await Book.findById(bookId);
    console.log(book);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    // Create the review
    const review = new Review({
      book: bookId,
      user: userId,
      rating,
      comment,
    });
    console.log(review);
    await review.save();
    console.log("Still working");
    // Update book's average rating and total reviews
    const reviews = await Review.find({ book: bookId });
    console.log(reviews);
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    book.averageRating = totalRating / reviews.length;
    book.totalReviews = reviews.length;
    console.log(book.averageRating);
    console.log(book.totalReviews);
    await book.save();
    console.log(book);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};


export const updateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, user: req.user._id },
      {
        rating: req.body.rating,
        comment: req.body.comment,
      },
      { new: true, runValidators: true }
    );

    if (!review) {
      res.status(404).json({ message: 'Review not found or unauthorized' });
      return;
    }

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      user: req.user._id,
    });

    if (!review) {
      res.status(404).json({ message: 'Review not found or unauthorized' });
      return;
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("getUserReviews");
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const reviews = await Review.find({ user: req.user._id })
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

      console.log(reviews);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get most recent reviews
export const getRecentReviews = async (_: Request, res: Response) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate({
        path: 'book',
        select: 'title author coverImage',
      })
      .populate({
        path: 'user',
        select: 'username profileImage',
      });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ message: 'Error fetching recent reviews' });
  }
};

// Get popular books this week
export const getPopularBooksThisWeek = async (_: Request, res: Response) => {
  try {
    // Get the date 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate reviews from the last 7 days, group by book, count, sort, limit
    const popular = await Review.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$book', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $project: { _id: 0, book: { _id: 1, title: 1, author: 1, coverImage: 1, averageRating: 1 }, reviewCount: 1 } },
    ]);
    console.log("Popular Books", popular);
    res.json(popular);
  } catch (error) {
    console.error('Error fetching popular books this week:', error);
    res.status(500).json({ message: 'Error fetching popular books this week' });
  }
};

// Get all possible book filter options
export const getBookFilterOptions = async (_: Request, res: Response) => {
  try {
    // Categories from enum
    const categories = ['Fiction', 'Non-Fiction', 'Educational', 'Biography', 'Science', 'Technology', 'Other'];
    // Unique genres
    const genres = await Book.distinct('genre');
    // Unique languages
    const languages = await Book.distinct('language');
    // Min/max pageCount
    const pageCounts = await Book.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: '$pageCount' },
          max: { $max: '$pageCount' }
        }
      }
    ]);
    const minPageCount = pageCounts[0]?.min || 0;
    const maxPageCount = pageCounts[0]?.max || 0;
    res.json({ categories, genres, languages, minPageCount, maxPageCount });
  } catch (error) {
    console.error('Error fetching book filter options:', error);
    res.status(500).json({ message: 'Error fetching book filter options' });
  }
}; 