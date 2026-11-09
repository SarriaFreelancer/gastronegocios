-- AlterTable: users to add permisos and roleId
ALTER TABLE `users` ADD COLUMN `permisos` TEXT NULL;
ALTER TABLE `users` ADD COLUMN `roleId` INTEGER NULL;

-- CreateTable: roles
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `permisos` TEXT NOT NULL,
    `restaurantId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `roles_restaurantId_fkey` (`restaurantId`),
    CONSTRAINT `roles_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: invoices
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroFactura` VARCHAR(191) NOT NULL,
    `orderId` INTEGER NULL,
    `cliente` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'mesa',
    `numeroMesa` VARCHAR(191) NULL,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `propina` DOUBLE NOT NULL DEFAULT 0,
    `costoEnvio` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `metodoPago` VARCHAR(191) NOT NULL DEFAULT 'Efectivo',
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Pagada',
    `itemsJson` TEXT NOT NULL,
    `esDividida` BOOLEAN NOT NULL DEFAULT false,
    `dinerNombre` VARCHAR(191) NULL,
    `dinerIndex` INTEGER NULL DEFAULT 1,
    `totalDiners` INTEGER NULL DEFAULT 1,
    `notas` TEXT NULL,
    `cajero` VARCHAR(191) NULL DEFAULT 'Mesero / Caja',
    `branchId` INTEGER NULL,
    `restaurantId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invoices_numeroFactura_key`(`numeroFactura`),
    INDEX `invoices_orderId_idx`(`orderId`),
    INDEX `invoices_branchId_idx`(`branchId`),
    INDEX `invoices_restaurantId_idx`(`restaurantId`),
    INDEX `invoices_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `invoices_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `invoices_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `invoices_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `nit` VARCHAR(191) NULL,
    `contacto` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` TEXT NULL,
    `ciudad` VARCHAR(191) NULL DEFAULT 'Cali',
    `categoria` VARCHAR(191) NULL DEFAULT 'General',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `restaurantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `suppliers_restaurantId_idx`(`restaurantId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `suppliers_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: supplies
CREATE TABLE IF NOT EXISTS `supplies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigoInterno` VARCHAR(191) NOT NULL,
    `codigoBarras` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'General',
    `unidadMedida` VARCHAR(191) NOT NULL DEFAULT 'g',
    `unidadCompra` VARCHAR(191) NULL DEFAULT 'kg',
    `factorConversion` DOUBLE NOT NULL DEFAULT 1,
    `stockActual` DOUBLE NOT NULL DEFAULT 0,
    `stockMinimo` DOUBLE NOT NULL DEFAULT 0,
    `stockMaximo` DOUBLE NOT NULL DEFAULT 0,
    `costoUnitario` DOUBLE NOT NULL DEFAULT 0,
    `costoPromedio` DOUBLE NOT NULL DEFAULT 0,
    `proveedorId` INTEGER NULL,
    `restaurantId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `supplies_restaurantId_idx`(`restaurantId`),
    INDEX `supplies_branchId_idx`(`branchId`),
    INDEX `supplies_proveedorId_idx`(`proveedorId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `supplies_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `supplies_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `supplies_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: inventory_movements
CREATE TABLE IF NOT EXISTS `inventory_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplyId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `saldoAnterior` DOUBLE NOT NULL,
    `saldoNuevo` DOUBLE NOT NULL,
    `costoUnitario` DOUBLE NOT NULL DEFAULT 0,
    `costoTotal` DOUBLE NOT NULL DEFAULT 0,
    `motivo` VARCHAR(191) NOT NULL DEFAULT 'Ajuste',
    `referencia` VARCHAR(191) NULL,
    `usuario` VARCHAR(191) NULL DEFAULT 'Sistema',
    `branchId` INTEGER NULL,
    `restaurantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_movements_supplyId_idx`(`supplyId`),
    INDEX `inventory_movements_restaurantId_idx`(`restaurantId`),
    INDEX `inventory_movements_branchId_idx`(`branchId`),
    INDEX `inventory_movements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `inventory_movements_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `inventory_movements_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `inventory_movements_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: recipes
CREATE TABLE IF NOT EXISTS `recipes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productoId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `porciones` INTEGER NOT NULL DEFAULT 1,
    `costoEstimado` DOUBLE NOT NULL DEFAULT 0,
    `instrucciones` TEXT NULL,
    `restaurantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `recipes_productoId_key`(`productoId`),
    INDEX `recipes_restaurantId_idx`(`restaurantId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `recipes_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `recipes_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: recipe_items
CREATE TABLE IF NOT EXISTS `recipe_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipeId` INTEGER NOT NULL,
    `supplyId` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `costoUnitarioCalculado` DOUBLE NOT NULL DEFAULT 0,
    `costoSubtotal` DOUBLE NOT NULL DEFAULT 0,
    `notas` VARCHAR(191) NULL,

    INDEX `recipe_items_recipeId_idx`(`recipeId`),
    INDEX `recipe_items_supplyId_idx`(`supplyId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `recipe_items_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `recipe_items_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: purchases
CREATE TABLE IF NOT EXISTS `purchases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroFactura` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DOUBLE NOT NULL DEFAULT 0,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Recibido',
    `metodoPago` VARCHAR(191) NOT NULL DEFAULT 'Efectivo',
    `observaciones` TEXT NULL,
    `registradoPor` VARCHAR(191) NULL DEFAULT 'Admin',
    `restaurantId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `purchases_restaurantId_idx`(`restaurantId`),
    INDEX `purchases_supplierId_idx`(`supplierId`),
    INDEX `purchases_branchId_idx`(`branchId`),
    INDEX `purchases_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `purchases_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `purchases_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `purchases_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: purchase_items
CREATE TABLE IF NOT EXISTS `purchase_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseId` INTEGER NOT NULL,
    `supplyId` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `precioUnitario` DOUBLE NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `lote` VARCHAR(191) NULL,
    `fechaVencimiento` DATETIME(3) NULL,

    INDEX `purchase_items_purchaseId_idx`(`purchaseId`),
    INDEX `purchase_items_supplyId_idx`(`supplyId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `purchase_items_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `purchase_items_supplyId_fkey` FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: customers
CREATE TABLE IF NOT EXISTS `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` TEXT NULL,
    `ciudad` VARCHAR(191) NULL DEFAULT 'Cali',
    `barrio` VARCHAR(191) NULL,
    `totalComprado` DOUBLE NOT NULL DEFAULT 0,
    `totalPedidos` INTEGER NOT NULL DEFAULT 0,
    `ultimaCompra` DATETIME(3) NULL,
    `notas` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `restaurantId` INTEGER NOT NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `customers_restaurantId_idx`(`restaurantId`),
    INDEX `customers_telefono_idx`(`telefono`),
    PRIMARY KEY (`id`),
    CONSTRAINT `customers_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: products
ALTER TABLE `products` 
    ADD COLUMN `stockMinimo` INTEGER NULL DEFAULT 5,
    ADD COLUMN `controlarStock` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `costo` DOUBLE NULL,
    ADD COLUMN `codigoBarras` VARCHAR(191) NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL;

-- AlterTable: restaurant_tables
ALTER TABLE `restaurant_tables` 
    ADD COLUMN `llamandoMesero` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `llamadoEn` DATETIME(3) NULL,
    ADD COLUMN `solicitudCuenta` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `solicitudCuentaEn` DATETIME(3) NULL,
    ADD COLUMN `metodoPagoCuenta` VARCHAR(191) NULL;

-- AlterTable: orders
ALTER TABLE `orders` 
    ADD COLUMN `repartidor` VARCHAR(191) NULL,
    ADD COLUMN `repartidorTel` VARCHAR(191) NULL,
    ADD COLUMN `customerId` INTEGER NULL,
    ADD COLUMN `cuentaDividida` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `numFacturas` INTEGER NOT NULL DEFAULT 1;

-- AlterTable: restaurants
ALTER TABLE `restaurants`
    ADD COLUMN `colorTerciario` VARCHAR(191) NOT NULL DEFAULT '#1a1a1a',
    ADD COLUMN `colorAcento` VARCHAR(191) NOT NULL DEFAULT '#ffc928',
    ADD COLUMN `colorSuperficie` VARCHAR(191) NOT NULL DEFAULT '#121212',
    ADD COLUMN `colorTexto` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    ADD COLUMN `colorTextoSecundario` VARCHAR(191) NOT NULL DEFAULT '#9ca3af',
    ADD COLUMN `colorBorde` VARCHAR(191) NOT NULL DEFAULT '#262626',
    ADD COLUMN `colorBoton` VARCHAR(191) NOT NULL DEFAULT '#ffc928',
    ADD COLUMN `colorBotonTexto` VARCHAR(191) NOT NULL DEFAULT '#000000',
    ADD COLUMN `colorNavegacion` VARCHAR(191) NOT NULL DEFAULT '#0a0a0a',
    ADD COLUMN `colorExito` VARCHAR(191) NOT NULL DEFAULT '#10b981',
    ADD COLUMN `colorAlerta` VARCHAR(191) NOT NULL DEFAULT '#f59e0b',
    ADD COLUMN `colorError` VARCHAR(191) NOT NULL DEFAULT '#ef4444',
    ADD COLUMN `plantilla` VARCHAR(191) NOT NULL DEFAULT 'plantilla-actual',
    ADD COLUMN `tituloHero` TEXT NULL,
    ADD COLUMN `subtituloHero` TEXT NULL,
    ADD COLUMN `descripcionHero` TEXT NULL,
    ADD COLUMN `textoBotonHero` VARCHAR(191) NULL DEFAULT 'Ver la Carta',
    ADD COLUMN `bannerPromocional` TEXT NULL,
    ADD COLUMN `textoPromocional` TEXT NULL,
    ADD COLUMN `tituloSeccionMenu` VARCHAR(191) NULL DEFAULT 'Nuestra Carta',
    ADD COLUMN `tituloSeccionDestacados` VARCHAR(191) NULL DEFAULT 'Los Más Pedidos',
    ADD COLUMN `mostrarHero` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mostrarCategorias` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mostrarDestacados` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mostrarPromociones` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mostrarResenas` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mostrarHorarios` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `ordenSecciones` TEXT NULL,
    ADD COLUMN `horarioAtencion` VARCHAR(191) NULL DEFAULT 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
    ADD COLUMN `redesSociales` TEXT NULL,
    ADD COLUMN `tipografia` VARCHAR(191) NOT NULL DEFAULT 'system',
    ADD COLUMN `radioBordes` VARCHAR(191) NOT NULL DEFAULT 'rounded-2xl',
    ADD COLUMN `estiloTarjetas` VARCHAR(191) NOT NULL DEFAULT 'card-glass',
    ADD COLUMN `columnasMenu` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `aparienciaMenu` VARCHAR(191) NOT NULL DEFAULT 'clasico',
    ADD COLUMN `aparienciaAdmin` VARCHAR(191) NOT NULL DEFAULT 'lateral',
    ADD COLUMN `politicaStockNegativo` VARCHAR(191) NOT NULL DEFAULT 'BLOQUEAR',
    ADD COLUMN `diasAnticipacionVencimiento` INTEGER NOT NULL DEFAULT 7,
    ADD COLUMN `modulosHabilitados` TEXT NULL,
    ADD COLUMN `seoTitulo` TEXT NULL,
    ADD COLUMN `seoDescripcion` TEXT NULL,
    ADD COLUMN `seoKeywords` TEXT NULL,
    ADD COLUMN `seoTipoNegocio` VARCHAR(191) NOT NULL DEFAULT 'Restaurant',
    ADD COLUMN `seoImagenCompartir` TEXT NULL,
    ADD COLUMN `seoUrlCanonica` TEXT NULL,
    ADD COLUMN `googleSearchConsoleCode` TEXT NULL,
    ADD COLUMN `googleAnalyticsId` VARCHAR(191) NULL,
    ADD COLUMN `mensajeWhatsappDefault` VARCHAR(191) NULL DEFAULT '¡Hola! Quiero hacer un pedido por la web.',
    ADD COLUMN `email` VARCHAR(191) NULL DEFAULT 'contacto@puntog.com',
    ADD COLUMN `correoRemitente` VARCHAR(191) NULL DEFAULT 'pedidos@puntog.com',
    ADD COLUMN `correoDestinatario` VARCHAR(191) NULL DEFAULT 'novedades@puntog.com',
    ADD COLUMN `fechaVencimiento` DATETIME(3) NULL,
    ADD COLUMN `limiteSedes` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `limiteProductos` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `limiteUsuarios` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `diasGracia` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `estadoLicencia` VARCHAR(191) NOT NULL DEFAULT 'ACTIVA';

-- Insert default superadmin user for GastroNegocios
INSERT INTO `users` (`nombre`, `email`, `password`, `rol`, `permisos`, `estado`, `createdAt`, `updatedAt`)
VALUES ('Super Administrador', 'superadmin@gastronegocios.com', 'admin123', 'Superadmin', '["*"]', 'Activo', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `rol` = 'Superadmin', `permisos` = '["*"]', `estado` = 'Activo';
