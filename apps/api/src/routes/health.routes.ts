import { Router } from 'express';
import {
  getDatabaseHealth,
  getHealth,
  getReadiness,
} from '../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', getHealth);
healthRouter.get('/database', getDatabaseHealth);
healthRouter.get('/ready', getReadiness);
