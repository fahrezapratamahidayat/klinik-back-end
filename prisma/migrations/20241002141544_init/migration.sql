/*
  Warnings:

  - You are about to drop the column `Kecamatan` on the `patient` table. All the data in the column will be lost.
  - Added the required column `kecamatan` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patient` DROP COLUMN `Kecamatan`,
    ADD COLUMN `kecamatan` VARCHAR(191) NOT NULL;
