// src/middleware/validateRequest.ts
import {  RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { APIError } from './errorHandler'; 


/**
 * Wrap a Zod schema to validate body/query/params in one go.
 * Usage: router.post('/', validateRequest(yourZodSchema), controller)
 */
export const validateRequest = (schema: AnyZodObject): RequestHandler =>
  (req, _res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map(e => `${e.path.join('.')} – ${e.message}`)
          .join('; ');
        const error: APIError = new Error(message);
        error.status = 400;
        return next(error);
      }
      next(err);
    }
  };
