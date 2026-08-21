CREATE TABLE `hotels` (
  `id` VARCHAR(30) NOT NULL,
  `sellerId` VARCHAR(30) NOT NULL,
  `universityId` VARCHAR(30) NOT NULL,
  `hotelName` VARCHAR(191) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `whatsappNumber` VARCHAR(15) NOT NULL,
  `description` TEXT NOT NULL,
  `hotelImageUrl` VARCHAR(500) NULL,
  `menuImageUrl` VARCHAR(500) NULL,
  `openTime` CHAR(5) NOT NULL,
  `closeTime` CHAR(5) NOT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectReason` VARCHAR(500) NULL,
  `approvedById` VARCHAR(30) NULL,
  `approvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `hotels_sellerId_key` (`sellerId`),
  INDEX `hotels_universityId_status_active_idx` (`universityId`, `status`, `active`),
  INDEX `hotels_status_createdAt_idx` (`status`, `createdAt`),
  INDEX `hotels_featured_status_active_idx` (`featured`, `status`, `active`),
  INDEX `hotels_approvedById_idx` (`approvedById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_sellerId_fkey`
  FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_universityId_fkey`
  FOREIGN KEY (`universityId`) REFERENCES `universities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_approvedById_fkey`
  FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
