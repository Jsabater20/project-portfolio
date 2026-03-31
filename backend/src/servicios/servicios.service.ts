import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServicioDto) {
    const { profesionalesId, ...rest } = data;

    return this.prisma.servicio.create({
      data: {
        ...rest,
        ...(profesionalesId && {
          profesionales: { connect: profesionalesId.map(id => ({ id })) },
        }),
      },
      include: { profesionales: true },
    });
  }

  async asignarProfesional(servicioId: number, profesionalId: number) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('El servicio no existe');

    const profesional = await this.prisma.profesional.findUnique({ where: { id: profesionalId } });
    if (!profesional) throw new NotFoundException('El profesional no existe');

    return this.prisma.servicio.update({
      where: { id: servicioId },
      data: {
        profesionales: { connect: { id: profesionalId } },
      },
      include: { profesionales: true },
    });
  }

  findAll() {
    return this.prisma.servicio.findMany({
      include: { profesionales: true },
    });
  }

  findByProfesional(profesionalId: number) {
    return this.prisma.servicio.findMany({
      where: {
        profesionales: { some: { id: profesionalId } },
      },
      include: { profesionales: true },
    });
  }

  async update(id: number, data: { nombre?: string; descripcion?: string; duracionMin?: number; precio?: number }) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id } });
    if (!servicio) throw new NotFoundException('El servicio no existe');

    return this.prisma.servicio.update({
      where: { id },
      data,
      include: { profesionales: true },
    });
  }

  async remove(id: number) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id } });
    if (!servicio) throw new NotFoundException('El servicio no existe');

    const turnos = await this.prisma.turno.count({ where: { servicioId: id } });
    if (turnos > 0) throw new BadRequestException('El servicio tiene historial de turnos y no puede eliminarse');

    return this.prisma.servicio.delete({ where: { id } });
  }
}