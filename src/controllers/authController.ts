import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface ErrorWithMessage {
  message: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, name, userType } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }
      if (existingUser.username === username) {
        res.status(400).json({ message: 'Username already exists' });
        return;
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      passwordHash,
      name,
      userType: userType || 'Reader',
      profileImage: '',
      wishlist: [],
      myReviews: [],
      listedBooks: [],
      isAdmin: false,
      permissionLevel: 1,
      createdBookList: [],
      followers: [],
      following: [],
      bio: '',
      recentlyRead: []
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: savedUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      name: savedUser.name,
      userType: savedUser.userType,
      profileImage: savedUser.profileImage,
      wishlist: savedUser.wishlist,
      myReviews: savedUser.myReviews,
      listedBooks: savedUser.listedBooks,
      isAdmin: savedUser.isAdmin,
      permissionLevel: savedUser.permissionLevel,
      createdBookList: savedUser.createdBookList,
      followers: savedUser.followers,
      following: savedUser.following,
      bio: savedUser.bio,
      recentlyRead: savedUser.recentlyRead
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      userType: user.userType,
      profileImage: user.profileImage,
      wishlist: user.wishlist,
      myReviews: user.myReviews,
      listedBooks: user.listedBooks,
      isAdmin: user.isAdmin,
      permissionLevel: user.permissionLevel,
      createdBookList: user.createdBookList,
      followers: user.followers,
      following: user.following,
      bio: user.bio,
      recentlyRead: user.recentlyRead
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}; 