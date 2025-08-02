import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, User } from '../types';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptRounds);
};

/**
 * Compare a password with its hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Generate a random token for email verification or password reset
 */
export const generateRandomToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Create a secure session token
 */
export const createSessionToken = (): string => {
  return require('crypto').randomBytes(64).toString('hex');
};
