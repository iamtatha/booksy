export interface Book {
  _id: string;
  title: string;
  author: string;
  author_username: string;
  description: string;
  coverImage: string;
  averageRating: number;
  totalReviews: number;
  publisher: string;
  publisher_username: string;
  publishedDate: string;
  language: string;
  edition: string;
  pageCount: number;
  amazonLink: string;
  isbn: string;
  genre: string[];
  category: string;
  listed_by_username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  book: string | {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
} 