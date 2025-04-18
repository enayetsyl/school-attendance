"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * Wrap a Zod schema to validate body/query/params in one go.
 * Usage: router.post('/', validateRequest(yourZodSchema), controller)
 */
const validateRequest = (schema) => (req, _res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const message = err.errors
                .map(e => `${e.path.join('.')} – ${e.message}`)
                .join('; ');
            const error = new Error(message);
            error.status = 400;
            return next(error);
        }
        next(err);
    }
};
exports.validateRequest = validateRequest;
