import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed/seed.js';
import { ensureInitialData } from './seed/safeSeed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users (e.g. fresh in-memory or new mongo instance)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Empty database detected. Auto-populating WedaMate seed dataset...');
      await seedDatabase();
    } else {
      // Ensure essential catalog data (categories, platform settings, services) exist without touching user accounts
      await ensureInitialData();
    }

    const server = app.listen(PORT, () => {
      console.log(`================================================`);
      console.log(`🚀 WedaMate API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`================================================`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
