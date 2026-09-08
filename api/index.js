import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

export default async function handler(req, res) {
  try {
    // Establish or reuse MongoDB Atlas connection
    await connectDB();

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
