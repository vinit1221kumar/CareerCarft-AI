import mongoose from 'mongoose';

const getMongoUri = () => {
  return process.env.MONGODB_URI;
};

export const connectDatabase = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MongoDB connection string is not configured');
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    console.log('✅ Auth Service connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

export const getDatabaseStatus = () => ({
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name
});
