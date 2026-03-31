import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfesionalesService } from './profesionales.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';

@Controller('profesionales')
export class ProfesionalesController {

  constructor(private readonly profesionalesService: ProfesionalesService) {}

  @Post()
  create(@Body() body: CreateProfesionalDto) {
    return this.profesionalesService.create(body);
  }

  @Get()
  findAll() {
    return this.profesionalesService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { nombre?: string; turno?: string; serviciosIds?: number[] },
  ) {
    return this.profesionalesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profesionalesService.remove(Number(id));
  }
}
