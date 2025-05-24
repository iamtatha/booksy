import { Request, Response } from 'express';
import Book from '../models/Book';
import User from '../models/user';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get all books
export const getBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a single book by ID
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid book ID format' });
      return;
    }

    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
};

// Create a new book
export const createBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating book:', req.body);
    const {
      title,
      author,
      author_username,
      description,
      coverImage,
      averageRating = 0,
      totalReviews = 0,
      publisher,
      publisher_username,
      publishedDate,
      language,
      edition,
      pageCount,
      amazonLink,
      isbn,
      genre = [],
      category,
      listed_by_username,
      role // 'author' or 'publisher'
    } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Create the book
    const newBook = new Book({
      title,
      author,
      author_username,
      description,
      coverImage,
      averageRating,
      totalReviews,
      publisher,
      publisher_username,
      publishedDate,
      language,
      edition,
      pageCount,
      amazonLink,
      isbn,
      genre,
      category,
      listed_by_username,
    });

    const savedBook = await newBook.save();

    // If user is authenticated, add book to their createdBookList or listedBooks
    if (req.user?._id) {
      if (role === 'author' || role === 'publisher') {
        await User.findByIdAndUpdate(req.user._id, { 
          $push: { createdBookList: savedBook._id } 
        });
      } else {
        await User.findByIdAndUpdate(req.user._id, { 
          $push: { listedBooks: savedBook._id } 
        });
      }
    }

    res.status(201).json({ ...savedBook.toObject(), role });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(400).json({ message: 'Error creating book', error });
  }
};

// Update a book
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a book
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search books with filters and search type
export const searchBooks = async (req: Request, res: Response): Promise<void> => {
  console.log('Search request received:', req.query);
  try {
    const {
      genres,
      categories,
      languages,
      minPages,
      maxPages,
      minRating,
      minYear,
      maxYear,
      query,
      type
    } = req.query;

    // Build the filter query
    const filter: any = {};

    // Add genre filter if provided
    if (genres) {
      const genreList = (genres as string).split(',');
      filter.genre = { $in: genreList };
    }

    // Add category filter if provided
    if (categories) {
      const categoryList = (categories as string).split(',');
      filter.category = { $in: categoryList };
    }

    // Add language filter if provided
    if (languages) {
      const languageList = (languages as string).split(',');
      filter.language = { $in: languageList };
    }

    // Add page count filter if provided
    if (minPages || maxPages) {
      filter.pageCount = {};
      if (minPages) filter.pageCount.$gte = parseInt(minPages as string);
      if (maxPages) filter.pageCount.$lte = parseInt(maxPages as string);
    }

    // Add rating filter if provided
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating as string) };
    }

    // Add publication year filter if provided
    if (minYear || maxYear) {
      filter.publicationYear = {};
      if (minYear) filter.publicationYear.$gte = parseInt(minYear as string);
      if (maxYear) filter.publicationYear.$lte = parseInt(maxYear as string);
    }

    // Add search by query and type
    if (query && typeof query === 'string' && query.trim() !== '') {
      const searchRegex = { $regex: query, $options: 'i' };
      if (type === 'title') {
        filter.title = searchRegex;
      } else if (type === 'author') {
        filter.author = searchRegex;
      } else if (type === 'genre') {
        filter.genre = searchRegex;
      } else {
        // Default: search in all
        filter.$or = [
          { title: searchRegex },
          { author: searchRegex },
          { genre: searchRegex }
        ];
      }
    }

    console.log('Search filter:', filter);

    // Find books matching the filter criteria
    const books = await Book.find(filter)
      .select('title author description coverImage averageRating totalReviews isbn createdAt genre category language pageCount publicationYear')
      .sort({ createdAt: -1 });

    console.log('Found books:', books.length);

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ 
      message: 'Error searching books',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 