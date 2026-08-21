ALTER TABLE `orders`
  ADD COLUMN `acceptedAt` DATETIME(3) NULL,
  ADD COLUMN `preparingAt` DATETIME(3) NULL,
  ADD COLUMN `readyAt` DATETIME(3) NULL,
  ADD COLUMN `completedAt` DATETIME(3) NULL,
  ADD COLUMN `rejectedAt` DATETIME(3) NULL,
  ADD COLUMN `cancelledAt` DATETIME(3) NULL,
  ADD COLUMN `paymentPaidAt` DATETIME(3) NULL;

CREATE TABLE `order_status_history` (
  `id` VARCHAR(30) NOT NULL,
  `orderId` VARCHAR(30) NOT NULL,
  `fromStatus` ENUM('PENDING','ACCEPTED','PREPARING','READY','COMPLETED','REJECTED','CANCELLED') NULL,
  `toStatus` ENUM('PENDING','ACCEPTED','PREPARING','READY','COMPLETED','REJECTED','CANCELLED') NOT NULL,
  `changedById` VARCHAR(30) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `order_status_history_orderId_createdAt_idx` (`orderId`, `createdAt`),
  INDEX `order_status_history_changedById_createdAt_idx` (`changedById`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `order_status_history` (`id`, `orderId`, `fromStatus`, `toStatus`, `changedById`, `createdAt`)
SELECT CONCAT('hist', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 21)), `id`, NULL, `status`, `userId`, `createdAt` FROM `orders`;

ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `order_status_history_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
