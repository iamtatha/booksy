import mongoose from 'mongoose';
import User from '../models/user';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookreview');
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const passwordHash = await bcrypt.hash('test123', 10);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: passwordHash,
    });

    await user.save();
    console.log('Test user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser(); 