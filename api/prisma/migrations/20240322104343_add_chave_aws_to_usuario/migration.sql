/*
  Warnings:

  - A unique constraint covering the columns `[chaveAws]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `chaveAws` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_chaveAws_key` ON `Usuario`(`chaveAws`);
