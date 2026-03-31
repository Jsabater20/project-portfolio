-- La columna y el índice ya se aplicaron manualmente.
-- Este archivo registra el cambio para que Prisma mantenga el historial en sync.

-- AlterTable: agregar columna precio (NOT NULL, sin default para filas futuras)
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "precio" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Servicio" ALTER COLUMN "precio" DROP DEFAULT;

-- CreateIndex: nombre único
CREATE UNIQUE INDEX IF NOT EXISTS "Servicio_nombre_key" ON "Servicio"("nombre");
