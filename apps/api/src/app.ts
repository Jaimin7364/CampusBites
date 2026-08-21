import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { requestId } from './middleware/request-id.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { roleTestRouter } from './routes/role-test.routes.js';
import {
  adminUniversityRouter,
  publicUniversityRouter,
} from './routes/university.routes.js';
import { adminHotelRouter, imageUploadRouter, publicHotelRouter, sellerHotelRouter } from './routes/hotel.routes.js';
import { uploadsRoot } from './services/image-storage.service.js';
import { publicMenuRouter, sellerMenuRouter } from './routes/menu.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { sellerOrderRouter } from './routes/seller-order.routes.js';
import { adminRouter } from './routes/admin.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.NODE_ENV === 'test' ? 10_000 : 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/role-check', roleTestRouter);
  app.use('/api/universities', publicUniversityRouter);
  app.use('/api/admin/universities', adminUniversityRouter);
  app.use('/uploads', (_request, response, next) => { response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); }, express.static(uploadsRoot, { fallthrough: true, index: false, maxAge: '1d' }));
  app.use('/api/seller', sellerHotelRouter);
  app.use('/api/admin/hotels', adminHotelRouter);
  app.use('/api/uploads', imageUploadRouter);
  app.use('/api/hotels', publicMenuRouter);
  app.use('/api/hotels', publicHotelRouter);
  app.use('/api/seller/menu', sellerMenuRouter);
  app.use('/api/orders', cartRouter);
  app.use('/api/seller/orders', sellerOrderRouter);
  app.use('/api/admin', adminRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
