import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {

  constructor(private prisma: PrismaService) {}

  async create(data: { nombre: string; email: string; telefono: string }) {
    try {
      return await this.prisma.cliente.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('El email ya está registrado');
      }

      throw error;
    }
  }

  async identificar(nombre: string, email: string, telefono: string) {
    const existente = await this.prisma.cliente.findUnique({ where: { email } });
    if (existente) return existente;

    return this.prisma.cliente.create({
      data: { nombre, email, telefono },
    });
  }

  findAll() {
    return this.prisma.cliente.findMany();
  }

  async getTurnos(clienteId: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('El cliente no existe');

    return this.prisma.turno.findMany({
      where: { clienteId },
      include: { servicio: true, profesional: true },
      orderBy: { inicio: 'desc' },
    });
  }
}