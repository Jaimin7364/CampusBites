import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/menu.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { createMenuItemSchema, hotelMenuParamsSchema, menuAvailabilitySchema, menuBestsellerSchema, menuItemIdParamsSchema, publicMenuQuerySchema, reorderMenuSchema, sellerMenuQuerySchema, updateMenuItemSchema } from '../validators/menu.validators.js';

export const publicMenuRouter = Router();
publicMenuRouter.get('/:hotelId/menu', validateParams(hotelMenuParamsSchema), validateQuery(publicMenuQuerySchema), controller.listPublic);

export const sellerMenuRouter = Router();
sellerMenuRouter.use(authenticate, authorize(UserRole.SELLER));
sellerMenuRouter.get('/', validateQuery(sellerMenuQuerySchema), controller.listSeller);
sellerMenuRouter.post('/', validateBody(createMenuItemSchema), controller.create);
sellerMenuRouter.patch('/reorder', validateBody(reorderMenuSchema), controller.reorder);
sellerMenuRouter.put('/:id', validateParams(menuItemIdParamsSchema), validateBody(updateMenuItemSchema), controller.update);
sellerMenuRouter.patch('/:id/availability', validateParams(menuItemIdParamsSchema), validateBody(menuAvailabilitySchema), controller.availability);
sellerMenuRouter.patch('/:id/bestseller', validateParams(menuItemIdParamsSchema), validateBody(menuBestsellerSchema), controller.bestseller);
sellerMenuRouter.delete('/:id', validateParams(menuItemIdParamsSchema), controller.remove);
