import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI!);
    
    console.log('Successfully connected to MongoDB!');
    
    // Get list of collections
    const collections = await mongoose.connection.db.collections();
    console.log('\nAvailable collections:');
    for (let collection of collections) {
      const count = await collection.countDocuments();
      console.log(`- ${collection.collectionName}: ${count} documents`);
    }

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  }
}

testConnection(); 