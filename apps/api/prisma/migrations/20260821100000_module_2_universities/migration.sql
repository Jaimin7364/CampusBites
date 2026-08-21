-- CreateTable
CREATE TABLE `universities` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `state` VARCHAR(120) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `universities_name_city_key`(`name`, `city`),
    INDEX `universities_active_name_idx`(`active`, `name`),
    INDEX `universities_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
