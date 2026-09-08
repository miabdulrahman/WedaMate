import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'wedamate_super_secret_jwt_key_2026_srilanka_market',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};
