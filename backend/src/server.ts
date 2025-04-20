// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import config from './config';
import { connectDB } from './config/db';
import router from './routes';

// Middleware
// import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Logger
import logger from './utils/logger';
import { authLimiter } from './utils/rateLimiter';
import cors from 'cors';

const app = express();

// 1. Global Middleware

// Enable CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://school‑attendance‑beta.vercel.app',
      'https://scd‑school‑attendance.vercel.app'  
    ],
    credentials: true
  })
);


// Parse JSON bodies
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('%s %s', req.method, req.originalUrl);
  next();
});

// 2. Rate‑limit your auth routes
app.use('/api/auth', authLimiter);

// 3. Mount your API router
app.use('/api/v1', router);

// 4. 404 handler
app.use(notFound);

// 5. Central error handler
app.use(errorHandler);

// 6. Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(config.MONGO_URI);
    logger.info('✅ MongoDB connected');

    // Listen for incoming requests
    app.listen(config.PORT, () => {
      logger.info(
        '🚀 [%s] Server running on http://localhost:%d',
        config.NODE_ENV,
        config.PORT
      );
    });
  } catch (err) {
    logger.error('Fatal startup error: %o', err);
    process.exit(1);
  }
};

startServer();
