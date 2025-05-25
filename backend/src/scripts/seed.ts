import mongoose from 'mongoose';
import { seedBooks } from '../utils/seedData';
import connectDB from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await seedBooks();
    console.log('Database seeded successfully');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 