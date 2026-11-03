-- CreateTable
CREATE TABLE IF NOT EXISTS `branches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `direccion` TEXT NULL,
    `telefono` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NOT NULL DEFAULT 'Cali',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `branches_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default initial branches
INSERT INTO `branches` (`nombre`, `slug`, `direccion`, `telefono`, `ciudad`, `activo`, `createdAt`, `updatedAt`)
VALUES 
  ('Sede Granada (Principal)', 'granada', 'Calle 9 # 45-12, Barrio Granada, Cali', '3229088736', 'Cali', true, NOW(), NOW()),
  ('Sede Ciudad Jardín', 'ciudad-jardin', 'Carrera 105 # 14-30, Ciudad Jardín, Cali', '3158092233', 'Cali', true, NOW(), NOW()),
  ('Sede San Antonio', 'san-antonio', 'Carrera 10 # 3-24, San Antonio, Cali', '3187654321', 'Cali', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `branchId` INTEGER NULL;

-- AlterTable
ALTER TABLE `restaurant_tables` ADD COLUMN `branchId` INTEGER NULL;

-- AlterTable
ALTER TABLE `orders` 
    ADD COLUMN `branchId` INTEGER NULL,
    ADD COLUMN `sedeNombre` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cash_shifts` ADD COLUMN `branchId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_tables` ADD CONSTRAINT `restaurant_tables_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_shifts` ADD CONSTRAINT `cash_shifts_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
