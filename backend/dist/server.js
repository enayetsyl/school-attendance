"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
// Middleware
// import { corsMiddleware } from './middleware/cors';
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Logger
const logger_1 = __importDefault(require("./utils/logger"));
const rateLimiter_1 = require("./utils/rateLimiter");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// 1. Global Middleware
// Enable CORS
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'https://school-attendance-beta.vercel.app'], credentials: true }));
// Parse JSON bodies
app.use(express_1.default.json());
// Request logging
app.use((req, _res, next) => {
    logger_1.default.info('%s %s', req.method, req.originalUrl);
    next();
});
// 2. Rate‑limit your auth routes
app.use('/api/auth', rateLimiter_1.authLimiter);
// 3. Mount your API router
app.use('/api/v1', routes_1.default);
// 4. 404 handler
app.use(notFound_1.notFound);
// 5. Central error handler
app.use(errorHandler_1.errorHandler);
// 6. Start Server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)(config_1.default.MONGO_URI);
        logger_1.default.info('✅ MongoDB connected');
        // Listen for incoming requests
        app.listen(config_1.default.PORT, () => {
            logger_1.default.info('🚀 [%s] Server running on http://localhost:%d', config_1.default.NODE_ENV, config_1.default.PORT);
        });
    }
    catch (err) {
        logger_1.default.error('Fatal startup error: %o', err);
        process.exit(1);
    }
};
startServer();
