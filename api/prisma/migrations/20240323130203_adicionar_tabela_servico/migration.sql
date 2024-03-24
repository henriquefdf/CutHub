/*
  Warnings:

  - You are about to alter the column `tipo` on the `Usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Usuario` MODIFY `tipo` ENUM('cliente', 'barbeiro', 'dono_barbearia') NOT NULL;

-- CreateTable
CREATE TABLE `Servico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `foto` VARCHAR(191) NULL,
    `chaveAws` VARCHAR(191) NULL,
    `barbeariaId` INTEGER NOT NULL,

    UNIQUE INDEX `Servico_chaveAws_key`(`chaveAws`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Servico` ADD CONSTRAINT `Servico_barbeariaId_fkey` FOREIGN KEY (`barbeariaId`) REFERENCES `Barbearia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
