-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT 'admin123',
    `rol` VARCHAR(191) NOT NULL DEFAULT 'Cajero',
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Activo',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `icono` VARCHAR(191) NOT NULL DEFAULT 'Utensils',
    `imagen` TEXT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `precio` DOUBLE NOT NULL,
    `imagen` TEXT NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `subcategoriaId` INTEGER NULL,
    `etiqueta` VARCHAR(191) NULL,
    `disponibilidad` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_tables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `capacidad` INTEGER NOT NULL DEFAULT 4,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Libre',
    `ubicacion` VARCHAR(191) NULL,
    `notas` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `restaurant_tables_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `cliente` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'domicilio',
    `mesaId` INTEGER NULL,
    `numeroMesa` VARCHAR(191) NULL,
    `direccion` TEXT NULL,
    `barrio` VARCHAR(191) NULL,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `propina` DOUBLE NOT NULL DEFAULT 0,
    `costoEnvio` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
    `metodoPago` VARCHAR(191) NOT NULL DEFAULT 'Efectivo',
    `notasCliente` TEXT NULL,
    `repartidor` VARCHAR(191) NULL,
    `repartidorTel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_codigo_key`(`codigo`),
    INDEX `orders_createdAt_idx`(`createdAt`),
    INDEX `orders_tipo_idx`(`tipo`),
    INDEX `orders_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `precio` DOUBLE NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `notas` TEXT NULL,
    `adicionales` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `precio` DOUBLE NOT NULL DEFAULT 0,
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'Toppings',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_shifts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cajero` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `baseInicial` DOUBLE NOT NULL DEFAULT 0,
    `ventasEfectivo` DOUBLE NOT NULL DEFAULT 0,
    `ventasTransfer` DOUBLE NOT NULL DEFAULT 0,
    `ventasDatafono` DOUBLE NOT NULL DEFAULT 0,
    `propinasTotal` DOUBLE NOT NULL DEFAULT 0,
    `totalVentas` DOUBLE NOT NULL DEFAULT 0,
    `totalEgresos` DOUBLE NOT NULL DEFAULT 0,
    `efectivoReal` DOUBLE NULL,
    `diferencia` DOUBLE NULL,
    `notas` TEXT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Abierto',
    `cerradoEn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shiftId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'Insumos',
    `creadoPor` VARCHAR(191) NULL DEFAULT 'Admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `mesaNumero` VARCHAR(191) NULL,
    `clienteNombre` VARCHAR(191) NOT NULL,
    `calificacion` INTEGER NOT NULL DEFAULT 5,
    `tipoVisita` VARCHAR(191) NOT NULL DEFAULT 'En Sitio / Mesa',
    `comentario` TEXT NOT NULL,
    `respuesta` TEXT NULL,
    `publicado` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL DEFAULT 'PUNTO G',
    `eslogan` VARCHAR(191) NOT NULL DEFAULT 'ANTOJOS QUE CONECTAN',
    `telefonoWhatsapp` VARCHAR(191) NOT NULL DEFAULT '3229088736',
    `direccion` VARCHAR(191) NOT NULL DEFAULT 'Calle 9 # 45-12, Barrio Granada, Cali',
    `horario` VARCHAR(191) NOT NULL DEFAULT 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
    `costoDomicilioBase` DOUBLE NOT NULL DEFAULT 5000,
    `propinaSugeridaPct` DOUBLE NOT NULL DEFAULT 10,
    `urlBaseSitio` VARCHAR(191) NOT NULL DEFAULT 'http://localhost:3005',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_subcategoriaId_fkey` FOREIGN KEY (`subcategoriaId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_mesaId_fkey` FOREIGN KEY (`mesaId`) REFERENCES `restaurant_tables`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_expenses` ADD CONSTRAINT `cash_expenses_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `cash_shifts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
