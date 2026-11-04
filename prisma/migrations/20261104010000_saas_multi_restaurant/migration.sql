-- CreateTable: restaurants
CREATE TABLE `restaurants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subdominio` VARCHAR(191) NULL,
    `dominio` VARCHAR(191) NULL,
    `eslogan` VARCHAR(191) NULL DEFAULT 'Antojos Que Conectan',
    `descripcion` TEXT NULL,
    `logo` TEXT NULL,
    `favicon` TEXT NULL,
    `bannerHero` TEXT NULL,
    `colorPrimario` VARCHAR(191) NOT NULL DEFAULT '#ffc928',
    `colorSecundario` VARCHAR(191) NOT NULL DEFAULT '#E94B24',
    `colorFondo` VARCHAR(191) NOT NULL DEFAULT '#080808',
    `telefonoWhatsapp` VARCHAR(191) NULL DEFAULT '3229088736',
    `instagram` VARCHAR(191) NULL,
    `direccionCentral` VARCHAR(191) NULL DEFAULT 'Calle 9 # 45-12, Granada, Cali',
    `ciudad` VARCHAR(191) NOT NULL DEFAULT 'Cali',
    `costoDomicilioBase` DOUBLE NOT NULL DEFAULT 5000,
    `propinaSugeridaPct` DOUBLE NOT NULL DEFAULT 10,
    `plan` VARCHAR(191) NOT NULL DEFAULT 'Pro',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `restaurants_slug_key`(`slug`),
    UNIQUE INDEX `restaurants_subdominio_key`(`subdominio`),
    UNIQUE INDEX `restaurants_dominio_key`(`dominio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add restaurantId to child tables
ALTER TABLE `users` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `branches` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `categories` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `products` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `restaurant_tables` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `orders` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `product_addons` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `cash_shifts` ADD COLUMN `restaurantId` INTEGER NULL;
ALTER TABLE `reviews` ADD COLUMN `restaurantId` INTEGER NULL;

-- Insert default restaurant "Punto G"
INSERT INTO `restaurants` (`id`, `nombre`, `slug`, `subdominio`, `eslogan`, `colorPrimario`, `colorSecundario`, `colorFondo`, `telefonoWhatsapp`, `activo`)
VALUES (1, 'Punto G', 'punto-g', 'puntog', 'Antojos Que Conectan | Comidas Rápidas Gourmet', '#ffc928', '#E94B24', '#080808', '3229088736', true)
ON DUPLICATE KEY UPDATE `slug` = 'punto-g';

-- Link existing records to Punto G (id = 1)
UPDATE `users` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `branches` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `categories` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `products` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `restaurant_tables` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `orders` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `product_addons` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `cash_shifts` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;
UPDATE `reviews` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;

-- Add Foreign Key Constraints
ALTER TABLE `users` ADD CONSTRAINT `users_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `branches` ADD CONSTRAINT `branches_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `categories` ADD CONSTRAINT `categories_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `products` ADD CONSTRAINT `products_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `restaurant_tables` ADD CONSTRAINT `restaurant_tables_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `orders` ADD CONSTRAINT `orders_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_addons` ADD CONSTRAINT `product_addons_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `cash_shifts` ADD CONSTRAINT `cash_shifts_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
