import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestId(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const incomingId = request.header('x-request-id');
  const id = incomingId?.trim() || randomUUID();
  response.locals.requestId = id;
  response.setHeader('x-request-id', id);
  next();
}
