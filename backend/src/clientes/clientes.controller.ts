import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Controller('clientes')
export class ClientesController {

  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() body: CreateClienteDto) {
    return this.clientesService.create(body);
  }

  @Post('identificar')
  identificar(@Body() body: { nombre: string; email: string; telefono: string }) {
    return this.clientesService.identificar(body.nombre, body.email, body.telefono);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id/turnos')
  getTurnos(@Param('id') id: string) {
    return this.clientesService.getTurnos(Number(id));
  }
}