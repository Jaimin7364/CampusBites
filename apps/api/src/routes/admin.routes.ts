import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import { adminAccountListQuerySchema, adminIdParamsSchema, adminOrderListQuerySchema } from '../validators/admin.validators.js';

export const adminRouter = Router();
adminRouter.use(authenticate, authorize(UserRole.ADMIN));
adminRouter.get('/dashboard', controller.dashboard);
adminRouter.get('/users', validateQuery(adminAccountListQuerySchema), controller.users);
adminRouter.get('/users/:id', validateParams(adminIdParamsSchema), controller.user);
adminRouter.get('/sellers', validateQuery(adminAccountListQuerySchema), controller.sellers);
adminRouter.get('/sellers/:id', validateParams(adminIdParamsSchema), controller.seller);
adminRouter.get('/orders', validateQuery(adminOrderListQuerySchema), controller.orders);
adminRouter.get('/orders/:id', validateParams(adminIdParamsSchema), controller.order);
