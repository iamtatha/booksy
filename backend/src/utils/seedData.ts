import Book from '../models/Book';

export const seedBooks = async () => {
  const books = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A story of decadence and excess...',
      coverImage: 'https://example.com/gatsby.jpg',
      isbn: '978-0743273565',
      averageRating: 4.5,
      totalReviews: 0,
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction...',
      coverImage: 'https://example.com/1984.jpg',
      isbn: '978-0451524935',
      averageRating: 4.7,
      totalReviews: 0,
    },
    // Add more books as needed
  ];

  try {
    await Book.insertMany(books);
    console.log('Sample books have been seeded');
  } catch (error) {
    console.error('Error seeding books:', error);
  }
}; 