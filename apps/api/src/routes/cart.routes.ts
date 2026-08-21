import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { cartPreviewSchema } from '../validators/cart.validators.js';
import * as orderController from '../controllers/order.controller.js';
import { createOrderSchema, orderIdParamsSchema } from '../validators/order.validators.js';
import { validateParams } from '../middleware/validate.js';

export const cartRouter = Router();
cartRouter.use(authenticate, authorize(UserRole.USER));
cartRouter.post('/preview', validateBody(cartPreviewSchema), controller.preview);
cartRouter.post('/', validateBody(createOrderSchema), orderController.create);
cartRouter.get('/:id', validateParams(orderIdParamsSchema), orderController.get);
