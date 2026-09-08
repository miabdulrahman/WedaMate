import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    let uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      try {
        console.log(`[Database] Attempting connection to MongoDB URI: ${uri}`);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 4000
        });
        console.log(`[Database] Connected to external MongoDB successfully.`);
        return mongoose.connection;
      } catch (err) {
        console.warn(`[Database] Failed to connect to configured MONGODB_URI: ${err.message}. Falling back to embedded MongoDB.`);
      }
    }

    // Fallback or default: embedded MongoDB Memory Server
    console.log(`[Database] Initializing embedded MongoDB server...`);
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
    console.error(`[Database Error] Could not establish MongoDB connection:`, error);
    process.exit(1);
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
