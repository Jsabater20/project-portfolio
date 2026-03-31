import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';

@Injectable()
export class ProfesionalesService {

  constructor(private prisma: PrismaService) {}

  create(data: CreateProfesionalDto) {
    return this.prisma.profesional.create({
      data: {
        nombre: data.nombre,
        turno: data.turno ?? 'mañana',
      },
    });
  }

  findAll() {
    return this.prisma.profesional.findMany({
      include: {
        servicios: true,
      },
    });
  }

  async update(id: number, data: { nombre?: string; turno?: string; serviciosIds?: number[] }) {
    const prof = await this.prisma.profesional.findUnique({ where: { id } });
    if (!prof) throw new NotFoundException('El profesional no existe');

    const { serviciosIds, ...rest } = data;
    return this.prisma.profesional.update({
      where: { id },
      data: {
        ...rest,
        ...(serviciosIds !== undefined && {
          servicios: { set: serviciosIds.map(sid => ({ id: sid })) },
        }),
      },
      include: { servicios: true },
    });
  }

  async remove(id: number) {
    const prof = await this.prisma.profesional.findUnique({ where: { id } });
    if (!prof) throw new NotFoundException('El profesional no existe');

    const turnos = await this.prisma.turno.count({ where: { profesionalId: id } });
    if (turnos > 0) throw new BadRequestException('El profesional tiene historial de turnos y no puede eliminarse');

    return this.prisma.profesional.delete({ where: { id } });
  }
}
