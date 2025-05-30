import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  author_username: string;
  description?: string;
  coverImage?: string;
  averageRating: number;
  totalReviews: number;
  publisher: string;
  publisher_username: string;
  publishedDate: Date;
  language: string;
  edition: string;
  pageCount: number;
  amazonLink?: string;
  isbn?: string;
  genre: string[];
  category: string;
  listed_by_username: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    author_username: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    coverImage: {
      type: String,
      required: false,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    publisher: {
      type: String,
      required: true,
    },
    publisher_username: {
      type: String,
      trim: true,
      default: '',
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    edition: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
    },
    amazonLink: {
      type: String,
      required: false,
      trim: true,
    },
    isbn: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    genre: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: ['Fiction', 'Non-Fiction', 'Educational', 'Biography', 'Science', 'Technology', 'Other'],
    },
    listed_by_username: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBook>('Book', BookSchema); 