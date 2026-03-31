import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

@Injectable()
export class TurnosService {

  constructor(private prisma: PrismaService) {}

  async create(data: CreateTurnoDto) {

    const servicio = await this.prisma.servicio.findUnique({
      where: { id: data.servicioId },
    });

    if (!servicio) {
      throw new BadRequestException('El servicio no existe');
    }

    const inicio = new Date(data.inicio);

    const fin = new Date(
      inicio.getTime() + servicio.duracionMin * 60000
    );

    const conflicto = await this.prisma.turno.findFirst({
      where: {
        profesionalId: data.profesionalId,
        estado: { not: 'cancelado' },
        AND: [
          { inicio: { lt: fin } },
          { fin: { gt: inicio } },
        ],
      },
    });

    if (conflicto) {
      throw new BadRequestException('El turno se superpone con otro existente');
    }

    return this.prisma.turno.create({
      data: {
        inicio,
        fin,
        clienteId: data.clienteId,
        servicioId: data.servicioId,
        profesionalId: data.profesionalId,
        estado: 'reservado',
      },
    });
  }

  findAll() {
    return this.prisma.turno.findMany({
      include: {
        cliente: true,
        servicio: true,
        profesional: true,
      },
    });
  }

  async getAgenda(profesionalId: number | null, fecha: string) {

    if (!fecha) {
      throw new BadRequestException('Falta la fecha');
    }

    // Parsear como medianoche local para evitar desfase UTC (ej: UTC-3)
    const start = new Date(`${fecha}T00:00:00`);
    const end   = new Date(`${fecha}T23:59:59.999`);

    return this.prisma.turno.findMany({
      where: {
        ...(profesionalId ? { profesionalId } : {}),
        inicio: {
          gte: start,
          lte: end,
        },
      },
      include: {
        cliente: true,
        servicio: true,
        profesional: true,
      },
      orderBy: {
        inicio: 'asc',
      },
    });
  }

  async cancelar(id: number) {

    const turno = await this.prisma.turno.findUnique({
      where: { id },
    });

    if (!turno) {
      throw new NotFoundException('El turno no existe');
    }

    if (turno.estado === 'cancelado') {
      throw new BadRequestException('El turno ya está cancelado');
    }

    return this.prisma.turno.update({
      where: { id },
      data: { estado: 'cancelado' },
    });
  }

  async completar(id: number) {
    const turno = await this.prisma.turno.findUnique({ where: { id } });

    if (!turno) {
      throw new NotFoundException('El turno no existe');
    }

    if (turno.estado === 'completado') {
      throw new BadRequestException('El turno ya está completado');
    }

    if (turno.estado === 'cancelado') {
      throw new BadRequestException('No se puede completar un turno cancelado');
    }

    return this.prisma.turno.update({
      where: { id },
      data: { estado: 'completado' },
    });
  }

  async getSemana(profesionalId: number | null, fechaInicio: string) {
    if (!fechaInicio) throw new BadRequestException('Falta la fechaInicio');

    const start = new Date(`${fechaInicio}T00:00:00`);
    const end   = new Date(`${fechaInicio}T00:00:00`);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return this.prisma.turno.findMany({
      where: {
        ...(profesionalId ? { profesionalId } : {}),
        inicio: { gte: start, lte: end },
      },
      include: { cliente: true, servicio: true, profesional: true },
      orderBy: { inicio: 'asc' },
    });
  }
}