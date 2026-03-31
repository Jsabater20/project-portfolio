import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  create(@Body() body: CreateServicioDto) {
    return this.serviciosService.create(body);
  }

  @Post(':id/profesionales/:profesionalId')
  asignarProfesional(
    @Param('id') id: string,
    @Param('profesionalId') profesionalId: string,
  ) {
    return this.serviciosService.asignarProfesional(Number(id), Number(profesionalId));
  }

  @Get()
  findAll(@Query('profesionalId') profesionalId?: string) {
    if (profesionalId) {
      return this.serviciosService.findByProfesional(Number(profesionalId));
    }
    return this.serviciosService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { nombre?: string; descripcion?: string; duracionMin?: number; precio?: number },
  ) {
    return this.serviciosService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(Number(id));
  }
}