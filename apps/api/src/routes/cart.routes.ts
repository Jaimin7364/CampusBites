import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { cartPreviewSchema } from '../validators/cart.validators.js';

export const cartRouter = Router();
cartRouter.use(authenticate, authorize(UserRole.USER));
cartRouter.post('/preview', validateBody(cartPreviewSchema), controller.preview);
