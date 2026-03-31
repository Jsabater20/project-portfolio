import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clientes
  await prisma.cliente.upsert({
    where: { email: 'maria@mail.com' },
    update: {},
    create: { nombre: 'María García', email: 'maria@mail.com', telefono: '1122334455' },
  });
  await prisma.cliente.upsert({
    where: { email: 'juana@mail.com' },
    update: {},
    create: { nombre: 'Juana López', email: 'juana@mail.com', telefono: '1166778899' },
  });
  await prisma.cliente.upsert({
    where: { email: 'carmen@mail.com' },
    update: {},
    create: { nombre: 'Carmen Pérez', email: 'carmen@mail.com', telefono: '1199001122' },
  });

  // Servicios
  const servicios = [
    // Faciales
    { nombre: 'Limpieza facial',    descripcion: 'Faciales', duracionMin: 60,  precio: 12000 },
    { nombre: 'Hidratación facial', descripcion: 'Faciales', duracionMin: 45,  precio: 10000 },
    { nombre: 'Peeling',            descripcion: 'Faciales', duracionMin: 60,  precio: 14000 },
    // Manos y uñas
    { nombre: 'Manicuría',          descripcion: 'Manos y uñas', duracionMin: 45,  precio: 8000  },
    { nombre: 'Kapping',            descripcion: 'Manos y uñas', duracionMin: 60,  precio: 12000 },
    { nombre: 'Uñas esculpidas',    descripcion: 'Manos y uñas', duracionMin: 90,  precio: 18000 },
    // Masajes y depilación
    { nombre: 'Depilación',         descripcion: 'Masajes y depilación', duracionMin: 30,  precio: 6000  },
    { nombre: 'Masajes',            descripcion: 'Masajes y depilación', duracionMin: 60,  precio: 15000 },
    { nombre: 'Drenaje linfático',  descripcion: 'Masajes y depilación', duracionMin: 60,  precio: 16000 },
    // Estética
    { nombre: 'Ácido hialurónico',  descripcion: 'Estética', duracionMin: 60,  precio: 45000 },
    { nombre: 'Plasma para cabello',descripcion: 'Estética', duracionMin: 60,  precio: 35000 },
    { nombre: 'Plasma para la piel',descripcion: 'Estética', duracionMin: 60,  precio: 30000 },
    // Peluquería
    { nombre: 'Corte de cabello',        descripcion: 'Peluquería', duracionMin: 45,  precio: 9000  },
    { nombre: 'Tinte',                   descripcion: 'Peluquería', duracionMin: 90,  precio: 20000 },
    { nombre: 'Extensiones y reflejos',  descripcion: 'Peluquería', duracionMin: 120, precio: 35000 },
  ];

  for (const s of servicios) {
    await prisma.servicio.upsert({
      where: { nombre: s.nombre },
      update: { duracionMin: s.duracionMin, precio: s.precio, descripcion: s.descripcion },
      create: s,
    });
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
