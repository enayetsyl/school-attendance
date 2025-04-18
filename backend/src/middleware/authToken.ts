// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { Role } from '../constant/roles';

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; [key: string]: any };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { message: 'No token' } });
    return 
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any;
    (req as AuthRequest).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: { message: 'Invalid token' } });
    return 
  }
};
