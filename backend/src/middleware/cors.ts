// src/middleware/cors.ts
import cors, { CorsOptions } from 'cors';
import config from '../config';

/**
 * Very permissive by default; replace origin: '*' with an array
 * of allowed origins in production (e.g. config.CORS_ORIGINS.split(','))
 */
const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
