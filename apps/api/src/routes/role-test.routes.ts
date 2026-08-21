import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { sendSuccess } from '../utils/api-response.js';

// These lightweight endpoints prove role middleware until domain portals add routes.
export const roleTestRouter = Router();

roleTestRouter.get('/user', authenticate, authorize(UserRole.USER), (_request, response) => {
  sendSuccess(response, { role: 'user', authorized: true });
});
roleTestRouter.get('/seller', authenticate, authorize(UserRole.SELLER), (_request, response) => {
  sendSuccess(response, { role: 'seller', authorized: true });
});
roleTestRouter.get('/admin', authenticate, authorize(UserRole.ADMIN), (_request, response) => {
  sendSuccess(response, { role: 'admin', authorized: true });
});
