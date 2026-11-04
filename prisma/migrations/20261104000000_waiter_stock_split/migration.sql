-- AlterTable
ALTER TABLE `products` 
    ADD COLUMN `stock` INTEGER NULL,
    ADD COLUMN `stockMinimo` INTEGER NULL DEFAULT 5,
    ADD COLUMN `controlarStock` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `costo` DOUBLE NULL;

-- AlterTable
ALTER TABLE `restaurant_tables` 
    ADD COLUMN `llamandoMesero` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `llamadoEn` DATETIME(3) NULL,
    ADD COLUMN `solicitudCuenta` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `solicitudCuentaEn` DATETIME(3) NULL,
    ADD COLUMN `metodoPagoCuenta` VARCHAR(191) NULL;
