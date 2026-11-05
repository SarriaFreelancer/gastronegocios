-- AlterTable: restaurants to add dedicated database & migration tracking
ALTER TABLE `restaurants` 
  ADD COLUMN `databaseType` VARCHAR(191) NOT NULL DEFAULT 'SHARED',
  ADD COLUMN `dbHost` VARCHAR(191) NULL,
  ADD COLUMN `dbPort` INTEGER NULL DEFAULT 3306,
  ADD COLUMN `dbName` VARCHAR(191) NULL,
  ADD COLUMN `dbUser` VARCHAR(191) NULL,
  ADD COLUMN `dbPassword` VARCHAR(191) NULL,
  ADD COLUMN `dbConnectionUrl` TEXT NULL,
  ADD COLUMN `dbStatus` VARCHAR(191) NULL DEFAULT 'COMPARTIDA',
  ADD COLUMN `migratedAt` DATETIME(3) NULL;
