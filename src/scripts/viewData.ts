import mongoose from 'mongoose';
import Book from '../models/Book';
import Review from '../models/Review';

async function viewData() {
  try {
    // Connect to MongoDB (using the same connection string as the server)
    await mongoose.connect('mongodb://127.0.0.1:27017/bookreview');
    console.log('Connected to MongoDB');

    // Fetch and display books
    console.log('\n=== Books ===');
    const books = await Book.find().lean();
    console.log(JSON.stringify(books, null, 2));

    // Fetch and display reviews
    console.log('\n=== Reviews ===');
    const reviews = await Review.find()
      .populate('user', 'username')
      .populate('book', 'title')
      .lean();
    console.log(JSON.stringify(reviews, null, 2));

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error viewing data:', error);
    process.exit(1);
  }
}

viewData(); 