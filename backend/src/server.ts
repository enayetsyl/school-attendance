// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import config from './config';
import { connectDB } from './config/db';
import router from './routes';
import cors from 'cors'

// Middleware
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Logger
import logger from './utils/logger';
import { authLimiter } from './utils/rateLimiter';

const app = express();

// 1. Global Middleware

const allowed = [
  'https://school-attendance-fe-livid.vercel.app',
  'http://localhost:3000',
]

// 2) CORS middleware:
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}))

// 3) Now your routes:
app.options('*', cors()) 

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
