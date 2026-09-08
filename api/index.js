import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env for local `vercel dev`
// On Vercel production, env vars are injected via the dashboard
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../server/.env') });

import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Cache the DB connection promise across warm invocations
let dbConnected = false;

export default async function handler(req, res) {
  try {
    // Establish or reuse MongoDB Atlas connection
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    // Ensure the path retains /api prefix for Express route mounting
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    return app(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Handler Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing request',
      error: process.env.NODE_ENV === 'production' ? 'Database connection failure' : error.message
    });
  }
}
