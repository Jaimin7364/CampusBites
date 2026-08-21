CREATE INDEX `users_role_createdAt_idx` ON `users`(`role`, `createdAt`);
CREATE INDEX `refresh_tokens_expiresAt_revokedAt_idx` ON `refresh_tokens`(`expiresAt`, `revokedAt`);
CREATE INDEX `password_reset_tokens_expiresAt_usedAt_idx` ON `password_reset_tokens`(`expiresAt`, `usedAt`);
CREATE INDEX `orders_status_paymentStatus_createdAt_idx` ON `orders`(`status`, `paymentStatus`, `createdAt`);
