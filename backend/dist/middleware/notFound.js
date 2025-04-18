"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (_req, res, _next) => {
    res.status(404).json({
        success: false,
        error: { message: 'Route not found', status: 404 },
    });
};
exports.notFound = notFound;
