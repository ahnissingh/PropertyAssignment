import jwt from 'jsonwebtoken';
const generateToken = (userId: string, email: string): string => {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '30d' }
    );
  };
export {generateToken};