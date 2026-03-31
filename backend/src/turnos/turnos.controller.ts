import { Body, Controller, Get, Post, Query, Patch, Param } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

@Controller('turnos')
export class TurnosController {

  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() body: CreateTurnoDto) {
    return this.turnosService.create(body);
  }

  @Get()
  findAll() {
    return this.turnosService.findAll();
  }

  @Get('agenda')
  getAgenda(
    @Query('profesionalId') profesionalId: string,
    @Query('fecha') fecha: string,
  ) {
    const pid = profesionalId ? Number(profesionalId) : null;
    return this.turnosService.getAgenda(pid, fecha);
  }

  @Get('semana')
  getSemana(
    @Query('profesionalId') profesionalId: string,
    @Query('fechaInicio') fechaInicio: string,
  ) {
    const pid = profesionalId ? Number(profesionalId) : null;
    return this.turnosService.getSemana(pid, fechaInicio);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.turnosService.cancelar(Number(id));
  }

  @Patch(':id/completar')
  completar(@Param('id') id: string) {
    return this.turnosService.completar(Number(id));
  }
}