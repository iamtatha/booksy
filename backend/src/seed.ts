import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Book from './models/Book';
import User from './models/user';
import Review from './models/Review';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookreview';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    // Create test users
    const users = [
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'test1',
        email: 'test1@example.com',
        passwordHash: await bcrypt.hash('test1', 10),
        name: 'Test User 1',
        profileImage: '',
        wishlist: [],
        myReviews: [],
        listedBooks: [],
        isAdmin: false,
        permissionLevel: 1,
        userType: 'Reader',
        createdBookList: [],
        followers: [],
        following: [],
        bio: 'Avid reader and book lover. Always looking for the next great story.',
        recentlyRead: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'test2',
        email: 'test2@example.com',
        passwordHash: await bcrypt.hash('test2', 10),
        name: 'Test User 2',
        profileImage: '',
        wishlist: [],
        myReviews: [],
        listedBooks: [],
        isAdmin: false,
        permissionLevel: 2,
        userType: 'Author',
        createdBookList: [],
        followers: [],
        following: [],
        bio: 'Published author sharing stories with the world.',
        recentlyRead: [],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'test3',
        email: 'test3@example.com',
        passwordHash: await bcrypt.hash('test3', 10),
        name: 'Test User 3',
        profileImage: '',
        wishlist: [],
        myReviews: [],
        listedBooks: [],
        isAdmin: false,
        permissionLevel: 2,
        userType: 'Seller',
        createdBookList: [],
        followers: [],
        following: [],
        bio: 'Book seller and publisher. Bringing great books to readers.',
        recentlyRead: [],
      },
    ];

    const createdUsers = await User.create(users);
    console.log('Created test users');

    // Create test books
    const books = [
      {
        title: '1984',
        author: 'George Orwell',
        author_username: createdUsers[1].username, // test2 is an author
        description: 'A dystopian social science fiction novel and cautionary tale.',
        coverImage: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
        publisher: 'Secker & Warburg',
        publisher_username: createdUsers[2].username, // test3 is a seller/publisher
        publishedDate: new Date('1949-06-08'),
        language: 'English',
        edition: 'First Edition',
        pageCount: 328,
        amazonLink: 'https://www.amazon.com/1984-Signet-Classics-George-Orwell/dp/0451524934',
        isbn: '9780451524935',
        genre: ['Science Fiction', 'Dystopian', 'Political'],
        category: 'Fiction',
        listed_by_username: createdUsers[0].username, // test1 is a reader who listed this book
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        author_username: createdUsers[1].username,
        description: 'A book on evolution that explains the gene-centered view of evolution.',
        coverImage: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
        publisher: 'Oxford University Press',
        publisher_username: createdUsers[2].username,
        publishedDate: new Date('1976-01-01'),
        language: 'English',
        edition: 'First Edition',
        pageCount: 224,
        amazonLink: 'https://www.amazon.com/Selfish-Gene-Anniversary-Landmark-Science/dp/0198788606',
        isbn: '9780198788607',
        genre: ['Science', 'Biology', 'Evolution'],
        category: 'Science',
        listed_by_username: createdUsers[0].username,
      },
    ];

    const createdBooks = await Book.insertMany(books);
    console.log('Created test books');

    // Update user references
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { listedBooks: { $each: createdBooks.map(book => book._id) } }
    });

    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { createdBookList: { $each: createdBooks.map(book => book._id) } }
    });

    console.log('Updated user references');

    // Create some test reviews
    const reviews = [
      {
        book: createdBooks[0]._id,
        user: createdUsers[0]._id,
        rating: 5,
        comment: 'A masterpiece of dystopian fiction. More relevant today than ever.',
      },
      {
        book: createdBooks[1]._id,
        user: createdUsers[0]._id,
        rating: 4,
        comment: 'Fascinating exploration of evolutionary biology. Changed my perspective.',
      },
    ];

    const createdReviews = await Review.create(reviews);
    console.log('Created test reviews');

    // Update user reviews
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { myReviews: { $each: createdReviews.map(review => review._id) } }
    });

    // Update book ratings
    for (const book of createdBooks) {
      const bookReviews = createdReviews.filter(review => review.book.toString() === book._id.toString());
      if (bookReviews.length > 0) {
        const averageRating = bookReviews.reduce((acc, review) => acc + review.rating, 0) / bookReviews.length;
        await Book.findByIdAndUpdate(book._id, {
          averageRating,
          totalReviews: bookReviews.length,
        });
      }
    }

    console.log('Updated book ratings');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed(); 