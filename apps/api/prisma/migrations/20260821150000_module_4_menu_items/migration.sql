CREATE TABLE `menu_items` (
  `id` VARCHAR(30) NOT NULL,
  `hotelId` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `pricePaise` INTEGER NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `veg` BOOLEAN NOT NULL,
  `bestseller` BOOLEAN NOT NULL DEFAULT false,
  `preparationTimeMinutes` INTEGER NOT NULL,
  `available` BOOLEAN NOT NULL DEFAULT true,
  `displayOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `menu_items_hotelId_name_key` (`hotelId`, `name`),
  INDEX `menu_items_hotelId_category_available_idx` (`hotelId`, `category`, `available`),
  INDEX `menu_items_hotelId_displayOrder_idx` (`hotelId`, `displayOrder`),
  INDEX `menu_items_hotelId_veg_available_idx` (`hotelId`, `veg`, `available`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_hotelId_fkey`
  FOREIGN KEY (`hotelId`) REFERENCES `hotels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
