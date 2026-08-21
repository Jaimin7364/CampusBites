import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/hotel.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { uploadOutletImage } from '../middleware/upload-image.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  adminHotelQuerySchema,
  featureHotelSchema,
  hotelActiveSchema,
  hotelIdParamsSchema,
  hotelInputSchema,
  rejectHotelSchema,
} from '../validators/hotel.validators.js';

export const sellerHotelRouter = Router();
sellerHotelRouter.use(authenticate, authorize(UserRole.SELLER));
sellerHotelRouter.get('/hotel', controller.getMine);
sellerHotelRouter.post('/hotel', validateBody(hotelInputSchema), controller.createMine);
sellerHotelRouter.put('/hotel/:id', validateParams(hotelIdParamsSchema), validateBody(hotelInputSchema), controller.updateMine);
sellerHotelRouter.post('/hotel/:id/resubmit', validateParams(hotelIdParamsSchema), controller.resubmitMine);

export const adminHotelRouter = Router();
adminHotelRouter.use(authenticate, authorize(UserRole.ADMIN));
adminHotelRouter.get('/', validateQuery(adminHotelQuerySchema), controller.listAdmin);
adminHotelRouter.get('/:id', validateParams(hotelIdParamsSchema), controller.getAdmin);
adminHotelRouter.put('/:id', validateParams(hotelIdParamsSchema), validateBody(hotelInputSchema), controller.updateAdmin);
adminHotelRouter.patch('/:id/approve', validateParams(hotelIdParamsSchema), controller.approve);
adminHotelRouter.patch('/:id/reject', validateParams(hotelIdParamsSchema), validateBody(rejectHotelSchema), controller.reject);
adminHotelRouter.patch('/:id/featured', validateParams(hotelIdParamsSchema), validateBody(featureHotelSchema), controller.feature);
adminHotelRouter.patch('/:id/active', validateParams(hotelIdParamsSchema), validateBody(hotelActiveSchema), controller.updateActive);
adminHotelRouter.delete('/:id', validateParams(hotelIdParamsSchema), controller.removeAdmin);

export const imageUploadRouter = Router();
imageUploadRouter.use(authenticate, authorize(UserRole.SELLER, UserRole.ADMIN));
imageUploadRouter.post('/outlet-image', uploadOutletImage, controller.uploadImage);
