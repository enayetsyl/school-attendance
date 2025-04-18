"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
// src/middleware/cors.ts
const cors_1 = __importDefault(require("cors"));
/**
 * Very permissive by default; replace origin: '*' with an array
 * of allowed origins in production (e.g. config.CORS_ORIGINS.split(','))
 */
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
exports.corsMiddleware = (0, cors_1.default)(corsOptions);
