import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route. Please log in.', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wedamate_super_secret_jwt_key_2026_srilanka_market');
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return sendError(res, 'The user belonging to this token no longer exists.', [], 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Your account has been suspended. Please contact WedaMate administration.', [], 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired authentication token. Please log in again.', [], 401);
  }
};
