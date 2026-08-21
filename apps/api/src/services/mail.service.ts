import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${env.WEB_ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;
  if (env.NODE_ENV !== 'production') {
    logger.info({ email, resetUrl }, 'Development password reset link');
    return;
  }

  // A production mail provider adapter will be connected before deployment.
  logger.warn({ email }, 'Password reset requested but production mail adapter is not configured');
}
