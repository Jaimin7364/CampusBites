import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSellerSchema,
  registerUserSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validators.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 10_000 : 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 10_000 : 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

authRouter.post('/register/user', authLimiter, validateBody(registerUserSchema), authController.registerUser);
authRouter.post('/register/seller', authLimiter, validateBody(registerSellerSchema), authController.registerSeller);
authRouter.post('/login', authLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/refresh', authLimiter, authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post(
  '/forgot-password',
  recoveryLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  '/reset-password',
  recoveryLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.get('/me', authenticate, authController.getMe);
authRouter.patch('/me', authenticate, validateBody(updateProfileSchema), authController.updateMe);
authRouter.patch(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword,
);
