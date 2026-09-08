import { sendError } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', [], 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user.role}' is not authorized to perform this action. Required: ${roles.join(', ')}`,
        [],
        403
      );
    }

    next();
  };
};
