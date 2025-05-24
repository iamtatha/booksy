import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
} from '../controllers/bookController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Protected routes
router.use(auth);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router; 