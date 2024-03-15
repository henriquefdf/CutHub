/*
  Warnings:

  - A unique constraint covering the columns `[tokenRecPass]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `dateRecPass` DATETIME(3) NULL,
    ADD COLUMN `foto` VARCHAR(191) NULL,
    ADD COLUMN `tokenRecPass` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_tokenRecPass_key` ON `Usuario`(`tokenRecPass`);
