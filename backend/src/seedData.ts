import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  author_username: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  publisher: { type: String, required: true },
  publisher_username: { type: String, required: true },
  publishedDate: { type: Date, required: true },
  language: { type: String, required: true },
  edition: { type: String },
  pageCount: { type: Number, required: true },
  amazonLink: { type: String },
  isbn: { type: String, required: true },
  genre: [{ type: String }],
  category: { type: String, required: true },
  listed_by_username: { type: String, required: true }
}, {
  timestamps: true
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, trim: true, default: '' },
  profileImage: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
  myReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  listedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  isAdmin: { type: Boolean, default: false },
  permissionLevel: { type: Number, required: true, default: 1, min: 1, max: 5 },
  userType: { type: String, required: true, enum: ['Author', 'Seller', 'Reader'], default: 'Reader' },
  createdBookList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bio: { type: String, default: '' },
  recentlyRead: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }]
}, {
  timestamps: true
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true }
}, {
  timestamps: true
});

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Review = mongoose.model('Review', reviewSchema);

// Dummy Users
const dummyUsers = [
  {
    username: "fscottfitzgerald",
    email: "scott@literature.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "F. Scott Fitzgerald",
    profileImage: "https://example.com/fitzgerald.jpg",
    bio: "American novelist and short story writer.",
    userType: "Author",
    permissionLevel: 2,
    isAdmin: false,
    wishlist: [],
    myReviews: [],
    listedBooks: [],
    createdBookList: [],
    followers: [],
    following: [],
    recentlyRead: []
  },
  {
    username: "georgeorwell",
    email: "orwell@literature.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "George Orwell",
    profileImage: "https://example.com/orwell.jpg",
    bio: "English novelist and essayist.",
    userType: "Author",
    permissionLevel: 2,
    isAdmin: false,
    wishlist: [],
    myReviews: [],
    listedBooks: [],
    createdBookList: [],
    followers: [],
    following: [],
    recentlyRead: []
  },
  {
    username: "janeausten",
    email: "austen@literature.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "Jane Austen",
    profileImage: "https://example.com/austen.jpg",
    bio: "English novelist known for romantic fiction.",
    userType: "Author",
    permissionLevel: 2,
    isAdmin: false,
    wishlist: [],
    myReviews: [],
    listedBooks: [],
    createdBookList: [],
    followers: [],
    following: [],
    recentlyRead: []
  },
  {
    username: "bookworm_alice",
    email: "alice@readers.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "Alice Johnson",
    profileImage: "https://example.com/alice.jpg",
    bio: "Avid reader and book reviewer",
    userType: "Reader",
    permissionLevel: 1,
    isAdmin: false,
    wishlist: [],
    myReviews: [],
    listedBooks: [],
    createdBookList: [],
    followers: [],
    following: [],
    recentlyRead: []
  },
  {
    username: "literary_bob",
    email: "bob@readers.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "Bob Smith",
    profileImage: "https://example.com/bob.jpg",
    bio: "Literature enthusiast and critic",
    userType: "Reader",
    permissionLevel: 1,
    isAdmin: false,
    wishlist: [],
    myReviews: [],
    listedBooks: [],
    createdBookList: [],
    followers: [],
    following: [],
    recentlyRead: []
  }
];

const dummyBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    author_username: "fscottfitzgerald",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    coverImage: "https://example.com/gatsby-cover.jpg",
    averageRating: 4.5,
    totalReviews: 1250,
    publisher: "Scribner",
    publisher_username: "scribner_pub",
    publishedDate: new Date("1925-04-10"),
    language: "English",
    edition: "First Edition",
    pageCount: 180,
    amazonLink: "https://amazon.com/great-gatsby",
    isbn: "978-0743273565",
    genre: ["Classic", "Fiction", "Literary Fiction"],
    category: "Fiction",
    listed_by_username: "classicbooks_admin"
  },
  {
    title: "1984",
    author: "George Orwell",
    author_username: "georgeorwell",
    description: "A dystopian social science fiction novel that follows Winston Smith in a totalitarian future society.",
    coverImage: "https://example.com/1984-cover.jpg",
    averageRating: 4.7,
    totalReviews: 2300,
    publisher: "Secker and Warburg",
    publisher_username: "secker_warburg",
    publishedDate: new Date("1949-06-08"),
    language: "English",
    edition: "First Edition",
    pageCount: 328,
    amazonLink: "https://amazon.com/1984",
    isbn: "978-0451524935",
    genre: ["Dystopian", "Science Fiction", "Political Fiction"],
    category: "Science Fiction",
    listed_by_username: "dystopia_curator"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    author_username: "janeausten",
    description: "A romantic novel following the character development of Elizabeth Bennet.",
    coverImage: "https://example.com/pride-prejudice-cover.jpg",
    averageRating: 4.6,
    totalReviews: 1800,
    publisher: "T. Egerton, Whitehall",
    publisher_username: "egerton_pub",
    publishedDate: new Date("1813-01-28"),
    language: "English",
    edition: "First Edition",
    pageCount: 432,
    amazonLink: "https://amazon.com/pride-prejudice",
    isbn: "978-0141439518",
    genre: ["Romance", "Classic", "Literary Fiction"],
    category: "Fiction",
    listed_by_username: "romance_classics"
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected successfully!');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert users
    const users = await User.insertMany(dummyUsers);
    console.log(`Added ${users.length} users`);

    // Insert books
    const books = await Book.insertMany(dummyBooks);
    console.log(`Added ${books.length} books`);

    // Create dummy reviews
    const dummyReviews = [
      {
        book: books[0]._id, // Great Gatsby
        user: users[3]._id, // Alice
        rating: 5,
        comment: "Fitzgerald's portrayal of the Jazz Age is simply magnificent. The way he captures the essence of the American Dream and its corruption is timeless."
      },
      {
        book: books[0]._id, // Great Gatsby
        user: users[4]._id, // Bob
        rating: 4,
        comment: "A beautiful exploration of wealth, love, and the American Dream. The prose is elegant and the story is captivating."
      },
      {
        book: books[1]._id, // 1984
        user: users[3]._id, // Alice
        rating: 5,
        comment: "Orwell's vision of a dystopian future feels increasingly relevant. A must-read for everyone."
      },
      {
        book: books[2]._id, // Pride and Prejudice
        user: users[4]._id, // Bob
        rating: 5,
        comment: "Austen's wit and social commentary shine through in this classic. Elizabeth and Mr. Darcy's story never gets old."
      }
    ];

    // Insert reviews
    const reviews = await Review.insertMany(dummyReviews);
    console.log(`Added ${reviews.length} reviews`);

    // Update user references
    for (let review of reviews) {
      await User.findByIdAndUpdate(review.user, {
        $push: { myReviews: review._id }
      });
    }

    // Update author references
    for (let book of books) {
      const author = users.find(u => u.username === book.author_username);
      if (author) {
        await User.findByIdAndUpdate(author._id, {
          $push: { createdBookList: book._id }
        });
      }
    }

    // Add some followers/following relationships
    await User.findByIdAndUpdate(users[3]._id, { // Alice follows all authors
      $push: { 
        following: { 
          $each: users.filter(u => u.userType === 'Author').map(u => u._id) 
        }
      }
    });

    for (const author of users.filter(u => u.userType === 'Author')) {
      await User.findByIdAndUpdate(author._id, {
        $push: { followers: users[3]._id } // Authors are followed by Alice
      });
    }

    // Verify the data
    console.log('\nDatabase Summary:');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Books: ${await Book.countDocuments()}`);
    console.log(`Reviews: ${await Review.countDocuments()}`);

    // Display some sample data
    console.log('\nSample Reviews:');
    const populatedReviews = await Review.find()
      .populate<{ user: { username: string, name: string } }>('user', 'username name')
      .populate<{ book: { title: string, author: string } }>('book', 'title author');
    
    populatedReviews.forEach(review => {
      console.log(`- Review by ${review.user.name} for "${review.book.title}"`);
      console.log(`  Rating: ${review.rating}/5`);
      console.log(`  Comment: ${review.comment.substring(0, 100)}...`);
    });

    // Display some user relationships
    const alice = await User.findById(users[3]._id)
      .populate<{ following: { name: string }[] }>('following', 'name');
    console.log('\nAlice is following:');
    alice?.following.forEach(followed => {
      console.log(`- ${followed.name}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedDatabase(); 