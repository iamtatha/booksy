import mongoose from 'mongoose';
import Book from '../models/Book';
import Review from '../models/Review';
import User, { User as UserType } from '../models/user';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51QuKZlfZaL._SX331_BO1,204,203,200_.jpg",
    publisher: "Scribner",
    publishedDate: new Date("1925-04-10"),
    language: "English",
    edition: "First Edition",
    pageCount: 180,
    amazonLink: "https://www.amazon.com/Great-Gatsby-F-Scott-Fitzgerald/dp/0743273560",
    isbn: "9780743273565",
    category: "Fiction",
    genre: ["Classic", "Literary Fiction"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "The story of racial injustice and the loss of innocence in the American South. The plot and characters are loosely based on Lee's observations of her family, her neighbors and an event that occurred near her hometown of Monroeville, Alabama, in 1936, when she was 10 years old.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51Ga5GuElyL._SX331_BO1,204,203,200_.jpg",
    publisher: "Grand Central Publishing",
    publishedDate: new Date("1960-07-11"),
    language: "English",
    edition: "50th Anniversary Edition",
    pageCount: 336,
    amazonLink: "https://www.amazon.com/Kill-Mockingbird-Harper-Lee/dp/0446310786",
    isbn: "9780446310789",
    category: "Fiction",
    genre: ["Classic", "Historical Fiction"]
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel and cautionary tale. The novel is set in Airstrip One, formerly Great Britain, a province of the superstate Oceania in a world of perpetual war, omnipresent government surveillance, and public manipulation.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Signet Classic",
    publishedDate: new Date("1949-06-08"),
    language: "English",
    edition: "Reissue Edition",
    pageCount: 328,
    amazonLink: "https://www.amazon.com/1984-Signet-Classics-George-Orwell/dp/0451524934",
    isbn: "9780451524935",
    category: "Fiction",
    genre: ["Science Fiction", "Dystopian"]
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel of manners. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Penguin Classics",
    publishedDate: new Date("1813-01-28"),
    language: "English",
    edition: "Penguin Classics Edition",
    pageCount: 432,
    amazonLink: "https://www.amazon.com/Pride-Prejudice-Penguin-Classics-Austen/dp/0141439513",
    isbn: "9780141439518",
    category: "Fiction",
    genre: ["Classic", "Romance"]
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "The story of teenage alienation and loss of innocence. The novel details two days in the life of 16-year-old Holden Caulfield after he has been expelled from prep school. Confused and disillusioned, Holden searches for truth and rails against the 'phoniness' of the adult world.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Little, Brown and Company",
    publishedDate: new Date("1951-07-16"),
    language: "English",
    edition: "Reprint Edition",
    pageCount: 234,
    amazonLink: "https://www.amazon.com/Catcher-Rye-J-D-Salinger/dp/0316769487",
    isbn: "9780316769488",
    category: "Fiction",
    genre: ["Classic", "Coming-of-age"]
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "A fantasy novel about the quest of home-loving hobbit Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon. Bilbo's journey takes him from light-hearted, rural surroundings into more sinister territory.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Houghton Mifflin Harcourt",
    publishedDate: new Date("1937-09-21"),
    language: "English",
    edition: "75th Anniversary Edition",
    pageCount: 310,
    amazonLink: "https://www.amazon.com/Hobbit-J-R-Tolkien/dp/054792822X",
    isbn: "9780547928227",
    category: "Fiction",
    genre: ["Fantasy", "Adventure"]
  },
  {
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    description: "A novel about the mental anguish and moral dilemmas of Rodion Raskolnikov, an impoverished ex-student in Saint Petersburg who formulates and executes a plan to kill an unscrupulous pawnbroker for her money.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Penguin Classics",
    publishedDate: new Date("1866-01-01"),
    language: "English",
    edition: "Penguin Classics Edition",
    pageCount: 671,
    amazonLink: "https://www.amazon.com/Crime-Punishment-Fyodor-Dostoevsky/dp/0143107631",
    isbn: "9780143107637",
    category: "Fiction",
    genre: ["Classic", "Psychological Fiction"]
  },
  {
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    description: "The multi-generational story of the Buendía family, whose patriarch, José Arcadio Buendía, founds the town of Macondo, the metaphoric Colombia.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Harper Perennial",
    publishedDate: new Date("1967-05-30"),
    language: "English",
    edition: "Modern Classics Edition",
    pageCount: 417,
    amazonLink: "https://www.amazon.com/One-Hundred-Years-Solitude/dp/0060883286",
    isbn: "9780060883287",
    category: "Fiction",
    genre: ["Magical Realism", "Literary Fiction"]
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A novel about an Andalusian shepherd boy named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure buried in the Pyramids.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "HarperOne",
    publishedDate: new Date("1988-01-01"),
    language: "English",
    edition: "25th Anniversary Edition",
    pageCount: 208,
    amazonLink: "https://www.amazon.com/Alchemist-Paulo-Coelho/dp/0062315005",
    isbn: "9780062315007",
    category: "Fiction",
    genre: ["Philosophical Fiction", "Adventure"]
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    description: "A story about the unlikely friendship between a wealthy boy and the son of his father's servant, set in a country that is in the process of being destroyed.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Riverhead Books",
    publishedDate: new Date("2003-05-29"),
    language: "English",
    edition: "First Edition",
    pageCount: 371,
    amazonLink: "https://www.amazon.com/Kite-Runner-Khaled-Hosseini/dp/159463193X",
    isbn: "9781594631931",
    category: "Fiction",
    genre: ["Historical Fiction", "Contemporary"]
  }
];

const userCreatedBooks = [
  {
    title: "The Art of Programming",
    author: "Test User 1",
    description: "A comprehensive guide to programming fundamentals and best practices.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Tech Publishing",
    publishedDate: new Date("2023-01-15"),
    language: "English",
    edition: "First Edition",
    pageCount: 450,
    amazonLink: "https://www.amazon.com/Art-Programming/dp/1234567890",
    isbn: "9781234567890",
    category: "Technology",
    genre: ["Programming", "Computer Science"]
  },
  {
    title: "Modern Web Development",
    author: "Test User 2",
    description: "Learn the latest web development technologies and frameworks.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Web Press",
    publishedDate: new Date("2023-03-20"),
    language: "English",
    edition: "Second Edition",
    pageCount: 380,
    amazonLink: "https://www.amazon.com/Modern-Web-Development/dp/0987654321",
    isbn: "9780987654321",
    category: "Technology",
    genre: ["Web Development", "JavaScript"]
  },
  {
    title: "Data Science Fundamentals",
    author: "Test User 3",
    description: "An introduction to data science concepts and techniques.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Data Publishing",
    publishedDate: new Date("2023-05-10"),
    language: "English",
    edition: "First Edition",
    pageCount: 520,
    amazonLink: "https://www.amazon.com/Data-Science-Fundamentals/dp/1122334455",
    isbn: "9781122334455",
    category: "Science",
    genre: ["Data Science", "Machine Learning"]
  },
  {
    title: "Creative Writing Guide",
    author: "Test User 4",
    description: "A practical guide to improving your creative writing skills.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Creative Press",
    publishedDate: new Date("2023-02-28"),
    language: "English",
    edition: "First Edition",
    pageCount: 320,
    amazonLink: "https://www.amazon.com/Creative-Writing-Guide/dp/5566778899",
    isbn: "9785566778899",
    category: "Educational",
    genre: ["Writing", "Creative Writing"]
  },
  {
    title: "Business Strategy 101",
    author: "Test User 5",
    description: "Essential business strategies for modern entrepreneurs.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51kfwGfX-1L._SX331_BO1,204,203,200_.jpg",
    publisher: "Business Books",
    publishedDate: new Date("2023-04-15"),
    language: "English",
    edition: "First Edition",
    pageCount: 400,
    amazonLink: "https://www.amazon.com/Business-Strategy-101/dp/9988776655",
    isbn: "9789988776655",
    category: "Non-Fiction",
    genre: ["Business", "Entrepreneurship"]
  }
];

const reviewComments = [
  "This book changed my perspective on life.",
  "A masterpiece of literature that everyone should read.",
  "The characters are so well-developed and relatable.",
  "I couldn't put it down! Finished it in one sitting.",
  "The plot twists kept me on the edge of my seat.",
  "Beautifully written with rich descriptions.",
  "A timeless classic that never gets old.",
  "The ending was unexpected but perfect.",
  "I've read this multiple times and it gets better each time.",
  "The author's writing style is captivating.",
  "A profound exploration of human nature.",
  "The world-building is absolutely incredible.",
  "This book made me laugh, cry, and think deeply.",
  "The character development is masterful.",
  "A perfect blend of action, emotion, and philosophy.",
  "The themes are still relevant today.",
  "The prose is elegant and powerful.",
  "A must-read for any book lover.",
  "The story stayed with me long after I finished reading.",
  "The author's insight into human psychology is remarkable."
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookreview');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Book.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create test users with different roles
    const users: UserType[] = [];
    const userTypes = ['Reader', 'Author', 'Seller'] as const;
    
    for (let i = 1; i <= 5; i++) {
      const passwordHash = await bcrypt.hash(`test${i}`, 10);
      const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
      
      const user = new User({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        username: `testuser${i}`,
        passwordHash: passwordHash,
        userType: userType,
        myReviews: [],
        listedBooks: [],
        createdBookList: [],
        followers: [],
        following: [],
        readBookList: [],
        readingBookList: [],
      });
      await user.save();
      users.push(user);
    }
    console.log('Created test users');

    // Insert standard books
    const insertedBooks = await Book.insertMany(books);
    console.log('Inserted standard books');

    // Insert user-created books and update users' createdBookList
    const userBooks = await Promise.all(userCreatedBooks.map(async (book, index) => {
      const userBook = new Book({
        ...book,
        createdBy: users[index]._id
      });
      const savedBook = await userBook.save();
      
      // Update user's createdBookList
      await User.findByIdAndUpdate(users[index]._id, {
        $push: { createdBookList: savedBook._id }
      });
      
      return savedBook;
    }));
    console.log('Inserted user-created books');

    // Combine all books
    const allBooks = [...insertedBooks, ...userBooks];

    // Assign listed books to users
    for (const user of users) {
      // Randomly assign 2-4 books to each user's listedBooks
      const numBooks = Math.floor(Math.random() * 3) + 2;
      const userBooks = [...allBooks]
        .sort(() => 0.5 - Math.random())
        .slice(0, numBooks);
      
      // Update user with listed books
      await User.findByIdAndUpdate(user._id, {
        $set: { listedBooks: userBooks.map(book => book._id) }
      });
    }
    console.log('Assigned listed books to users');

    // Create reviews for each book and update users' myReviews
    for (const book of allBooks) {
      // Use different users for each review
      for (let i = 0; i < 5; i++) {
        const rating = Math.floor(Math.random() * 5) + 1;
        const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        
        const review = new Review({
          book: book._id,
          user: users[i]._id,
          rating,
          comment,
        });
        const savedReview = await review.save();

        // Add review to user's myReviews array
        await User.findByIdAndUpdate(users[i]._id, {
          $push: { myReviews: savedReview._id }
        });
      }
    }
    console.log('Inserted reviews');

    // Update book ratings
    for (const book of allBooks) {
      const reviews = await Review.find({ book: book._id });
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Book.findByIdAndUpdate(book._id, {
        averageRating,
        totalReviews: reviews.length,
      });
    }
    console.log('Updated book ratings');

    // Update users with created books and followers/following relationships
    await Promise.all([
      // John Doe follows Jane Smith and Bob Wilson
      User.findByIdAndUpdate(users[0]._id, {
        $push: {
          following: [users[1]._id, users[2]._id],
          readBookList: insertedBooks[0]._id,
          readingBookList: insertedBooks[1]._id,
        }
      }),
      // Jane Smith follows John Doe
      User.findByIdAndUpdate(users[1]._id, {
        $push: {
          following: users[0]._id,
          createdBookList: insertedBooks[0]._id,
          readBookList: insertedBooks[1]._id,
        }
      }),
      // Bob Wilson follows John Doe and Jane Smith
      User.findByIdAndUpdate(users[2]._id, {
        $push: {
          following: [users[0]._id, users[1]._id],
          listedBooks: insertedBooks[1]._id,
          readBookList: [insertedBooks[0]._id, insertedBooks[1]._id],
        }
      }),
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 