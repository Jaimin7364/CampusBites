import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/seller-order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { sellerOrderIdParamsSchema, sellerOrderListQuerySchema, sellerOrderStatusSchema, sellerPaymentStatusSchema } from '../validators/seller-order.validators.js';

export const sellerOrderRouter = Router();
sellerOrderRouter.use(authenticate, authorize(UserRole.SELLER));
sellerOrderRouter.get('/summary', controller.summary);
sellerOrderRouter.get('/', validateQuery(sellerOrderListQuerySchema), controller.list);
sellerOrderRouter.get('/:id', validateParams(sellerOrderIdParamsSchema), controller.detail);
sellerOrderRouter.patch('/:id/status', validateParams(sellerOrderIdParamsSchema), validateBody(sellerOrderStatusSchema), controller.status);
sellerOrderRouter.patch('/:id/payment-status', validateParams(sellerOrderIdParamsSchema), validateBody(sellerPaymentStatusSchema), controller.paymentStatus);
