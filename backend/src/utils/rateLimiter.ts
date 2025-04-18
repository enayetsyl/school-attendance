// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

/**
 * Example: apply to auth routes to prevent brute‑force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // limit each IP to 10 requests per window
  standardHeaders: true,    // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,     // Disable the X-RateLimit-* headers
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
});
