"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...allowed) => (req, res, next) => {
    const user = req.user;
    if (!user || !allowed.includes(user.role)) {
        res.status(403).json({
            success: false,
            error: { message: 'Forbidden: insufficient privileges' },
        });
        return;
    }
    next();
};
exports.authorize = authorize;
