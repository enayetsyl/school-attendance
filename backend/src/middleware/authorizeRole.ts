// src/middleware/authorizeRole.ts
import { RequestHandler } from 'express';
import { AuthRequest } from './authToken';
import { Role } from '../constant/roles';

export const authorize =
  (...allowed: Role[]): RequestHandler =>
  (req, res, next) => {
    const user = (req as AuthRequest).user;
    if (!user || !allowed.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: insufficient privileges' },
      });
      return;
    }
    next();
  };
