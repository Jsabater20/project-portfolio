/*
  Warnings:

  - Made the column `telefono` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- Rellenar filas existentes con valor por defecto antes de hacer NOT NULL
UPDATE "Cliente" SET "telefono" = 'sin_telefono' WHERE "telefono" IS NULL;

-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "telefono" SET NOT NULL;
