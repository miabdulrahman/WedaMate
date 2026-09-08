import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }
    const uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      try {
        console.log(`[Database] Connecting to MongoDB Atlas...`);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`[Database] Connected to MongoDB successfully.`);
        return mongoose.connection;
      } catch (err) {
        console.warn(`[Database] Failed to connect to configured MONGODB_URI: ${err.message}`);
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          throw err;
        }
      }
    }

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is required in production.');
    }

    // Fallback or default: embedded MongoDB Memory Server for offline local dev
    console.log(`[Database] Initializing embedded MongoDB server...`);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'wedamate'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to embedded MongoDB at ${memoryUri}`);
    return mongoose.connection;
  } catch (error) {
    console.error(`[Database Error] Could not establish MongoDB connection:`, error.message || error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error('[Database Error] Error during connection close:', error);
  }
};
