import type { Response } from 'express';
import type { ApiSuccess } from '../types/api.js';

export function sendSuccess<T>(response: Response, data: T, status = 200) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(response.locals.requestId
      ? { requestId: response.locals.requestId as string }
      : {}),
  };

  return response.status(status).json(body);
}
