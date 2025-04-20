// src/middleware/cors.ts
import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'https://school-attendance-fe-livid.vercel.app',
  'http://localhost:3000',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
