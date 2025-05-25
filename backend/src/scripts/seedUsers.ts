import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import BookModel from '../models/Book';
import ReviewModel from '../models/Review';

const MONGODB_URI = 'mongodb://localhost:27017/bookreview';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Get some existing books and reviews for references
    const books = await BookModel.find().limit(5);
    const reviews = await ReviewModel.find().limit(5);

    if (books.length === 0 || reviews.length === 0) {
      console.error('No books or reviews found in the database. Please seed books and reviews first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@bookreview.com',
      passwordHash: adminPasswordHash,
      wishlist: [books[0]._id, books[1]._id],
      myReviews: [reviews[0]._id, reviews[1]._id],
      listedBooks: [books[2]._id, books[3]._id],
      isAdmin: true
    });
    await admin.save();

    // Create regular users
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        wishlist: [books[1]._id, books[2]._id],
        myReviews: [reviews[2]._id],
        listedBooks: [books[4]._id]
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        wishlist: [books[3]._id],
        myReviews: [reviews[3]._id],
        listedBooks: [books[0]._id, books[1]._id]
      },
      {
        username: 'book_lover',
        email: 'booklover@example.com',
        password: 'password123',
        wishlist: [books[4]._id],
        myReviews: [reviews[4]._id],
        listedBooks: []
      }
    ];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash,
        wishlist: userData.wishlist,
        myReviews: userData.myReviews,
        listedBooks: userData.listedBooks
      });
      await user.save();
    }

    console.log('Successfully seeded users');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedUsers(); 