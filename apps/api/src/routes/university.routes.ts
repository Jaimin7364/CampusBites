import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/university.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  adminUniversityQuerySchema,
  createUniversitySchema,
  publicUniversityQuerySchema,
  universityIdParamsSchema,
  universityStatusSchema,
  updateUniversitySchema,
} from '../validators/university.validators.js';

export const publicUniversityRouter = Router();
publicUniversityRouter.get('/', validateQuery(publicUniversityQuerySchema), controller.listPublic);

export const adminUniversityRouter = Router();
adminUniversityRouter.use(authenticate, authorize(UserRole.ADMIN));
adminUniversityRouter.get('/', validateQuery(adminUniversityQuerySchema), controller.listAdmin);
adminUniversityRouter.get(
  '/:id',
  validateParams(universityIdParamsSchema),
  controller.getAdminDetail,
);
adminUniversityRouter.post('/', validateBody(createUniversitySchema), controller.create);
adminUniversityRouter.put(
  '/:id',
  validateParams(universityIdParamsSchema),
  validateBody(updateUniversitySchema),
  controller.update,
);
adminUniversityRouter.patch(
  '/:id/status',
  validateParams(universityIdParamsSchema),
  validateBody(universityStatusSchema),
  controller.updateStatus,
);
adminUniversityRouter.delete(
  '/:id',
  validateParams(universityIdParamsSchema),
  controller.remove,
);
