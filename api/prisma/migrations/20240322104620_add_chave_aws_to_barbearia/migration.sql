/*
  Warnings:

  - A unique constraint covering the columns `[chaveAws]` on the table `Barbearia` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Barbearia` ADD COLUMN `chaveAws` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Barbearia_chaveAws_key` ON `Barbearia`(`chaveAws`);
