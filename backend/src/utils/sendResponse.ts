// src/utils/sendResponse.ts
import { Response } from 'express';

interface SendResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T = any>({
  res,
  statusCode = 200,
  success = true,
  message,
  data,
  meta,
}: SendResponseOptions<T>) => {
  const payload: Record<string, any> = { success };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};
