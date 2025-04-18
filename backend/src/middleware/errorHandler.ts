// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface APIError extends Error {
  status?: number;
}

export const errorHandler = (
  err: APIError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    error: { message, status },
  });
};
