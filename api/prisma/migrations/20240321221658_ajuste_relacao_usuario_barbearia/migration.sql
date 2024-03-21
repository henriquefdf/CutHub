/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId]` on the table `Barbearia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Barbearia_usuarioId_key` ON `Barbearia`(`usuarioId`);
