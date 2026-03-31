/*
  Warnings:

  - You are about to drop the column `profesionalId` on the `Servicio` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Servicio" DROP CONSTRAINT "Servicio_profesionalId_fkey";

-- AlterTable
ALTER TABLE "Servicio" DROP COLUMN "profesionalId";

-- CreateTable
CREATE TABLE "_ProfesionalToServicio" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProfesionalToServicio_AB_unique" ON "_ProfesionalToServicio"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfesionalToServicio_B_index" ON "_ProfesionalToServicio"("B");

-- AddForeignKey
ALTER TABLE "_ProfesionalToServicio" ADD CONSTRAINT "_ProfesionalToServicio_A_fkey" FOREIGN KEY ("A") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfesionalToServicio" ADD CONSTRAINT "_ProfesionalToServicio_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
